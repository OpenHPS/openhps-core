import { DataFrame } from '../../data';
import { ProcessingNode, ProcessingNodeOptions } from '../ProcessingNode';
import { TimeUnit } from '../../utils';
import { TimeService } from '../../service';
import { PushOptions } from '../../graph/options';
import { PushError } from '../../graph/events';

/**
 * Merge data frames from two or more sources
 * using a certain merge key (e.g. source uid, parent uid, node uid).
 *
 * @category Flow shape
 */
export abstract class MergeShape<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _queue: Map<any, QueuedMerge<InOut>> = new Map();
    private _timeout: number;
    private _timer: NodeJS.Timeout;
    private _mergeKeyFn: (frame: InOut, options?: PushOptions) => any;
    private _groupFn: (frame: InOut, options?: PushOptions) => any;
    protected options: MergeShapeOptions;

    constructor(
        mergeFn: (frame: InOut, options?: PushOptions) => any,
        groupFn: (frame: InOut, options?: PushOptions) => any,
        options?: MergeShapeOptions,
    ) {
        super(options);
        this._mergeKeyFn = mergeFn;
        this._groupFn = groupFn;

        // Merge timeout
        this.options.timeout = this.options.timeout || 100;
        this.options.timeoutUnit = this.options.timeoutUnit || TimeUnit.MILLISECOND;

        this._timeout = this.options.timeoutUnit.convert(this.options.timeout, TimeUnit.MILLISECOND);

        this.once('build', this._start.bind(this));
        this.once('destroy', this._stop.bind(this));
    }

    /**
     * Start the timeout timer
     *
     * @returns {Promise<void>} Timer promise
     */
    private _start(): Promise<void> {
        return new Promise((resolve) => {
            this.options.minCount = this.options.minCount || this.inlets.length;
            this.options.maxCount = this.options.maxCount || this.inlets.length;

            if (this._timeout > 0) {
                this._timer = setInterval(this._timerTick.bind(this), this._timeout);
            }
            resolve();
        });
    }

    private _timerTick(): void {
        const currentTime = TimeService.now();
        const mergedFrames: Array<InOut> = [];
        this._queue.forEach((queue) => {
            if (currentTime - queue.timestamp >= this._timeout && queue.frames.size >= this.options.minCount) {
                const frames = Array.from(queue.frames.values());
                try {
                    // Merge node
                    mergedFrames.push(this.merge(frames, queue.key as string));
                    this._queue.delete(queue.key);
                    // Resolve pending promises
                    queue.promises.forEach((fn) => {
                        fn(undefined);
                    });
                } catch (ex) {
                    this.emit('error', new PushError(frames[0].uid, this.uid, ex));
                }
            }
        });
        mergedFrames.forEach((frame) => {
            this.outlets.forEach((outlet) => outlet.push(frame));
        });
    }

    private _stop(): void {
        if (this._timer !== undefined) {
            clearInterval(this._timer);
        }
    }

    public process(frame: InOut, options?: PushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            if (this.options.maxCount === 1) {
                return resolve(frame);
            }

            // Merge key(s)
            const merge = this._mergeKeyFn(frame, options);
            if (merge === undefined) {
                return resolve(undefined);
            }
            (Array.isArray(merge) ? merge : [merge]).forEach((key) => {
                let queue = this._queue.get(key);
                if (queue === undefined) {
                    // Create a new queued data frame based on the key
                    queue = new QueuedMerge(key);
                    queue.promises.push(resolve);
                    // Group the frames by the grouping function
                    queue.frames.set(this._groupFn(frame, options), frame);
                    this._queue.set(key, queue);
                } else {
                    const groupKey = this._groupFn(frame, options);
                    if (queue.frames.has(groupKey)) {
                        // Merge frames
                        queue.frames.set(groupKey, this.merge([queue.frames.get(groupKey), frame]));
                    } else {
                        queue.frames.set(groupKey, frame);
                    }
                    // Check if there are enough frames
                    if (queue.frames.size >= this.options.maxCount) {
                        this._queue.delete(key);
                        const mergedFrame = this.merge(Array.from(queue.frames.values()), key);
                        resolve(mergedFrame);
                        queue.promises.forEach((fn) => {
                            fn(undefined);
                        });
                    } else {
                        queue.promises.push(resolve);
                    }
                }
            });
        });
    }

    /**
     * Merge the data frames
     *
     * @param {DataFrame[]} frames Data frames to merge
     * @param {string} [key=undefined] Key to merge on
     * @returns {Promise<DataFrame>} Promise of merged data frame
     */
    public abstract merge(frames: InOut[], key?: string): InOut;
}

/**
 * Queued merge
 */
class QueuedMerge<InOut extends DataFrame> {
    public key: any;
    public frames: Map<any, InOut> = new Map();
    public promises: Array<(value: InOut) => void> = [];
    public timestamp: number;

    constructor(key: any) {
        this.key = key;
        this.timestamp = TimeService.now();
    }
}

export interface MergeShapeOptions extends ProcessingNodeOptions {
    timeout?: number;
    timeoutUnit?: TimeUnit;
    minCount?: number;
    /**
     * Maximum number of frames to merge
     *
     * @default inlets.length Based on the amount of inlets
     */
    maxCount?: number;
}
