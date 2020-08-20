import { DataFrame } from '../../data';
import { ProcessingNode } from '../ProcessingNode';
import { TimeUnit } from '../../utils';

export class FrameMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _queue: Map<any, QueuedMerge<InOut>> = new Map();
    private _timeout: number;
    private _timer: NodeJS.Timeout;
    private _mergeFn: (frame: InOut) => any;
    private _groupFn: (frame: InOut) => any;

    constructor(
        mergeFn: (frame: InOut) => any,
        groupFn: (frame: InOut) => any,
        timeout: number,
        timeoutUnit: TimeUnit,
    ) {
        super();
        this._mergeFn = mergeFn;
        this._groupFn = groupFn;

        this._timeout = timeoutUnit.convert(timeout, TimeUnit.MILLISECOND);

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
            this._timer = setInterval(this._timerTick.bind(this), this._timeout);
            resolve();
        });
    }

    private _timerTick(): void {
        const currentTime = new Date().getTime();
        const mergePromises: Array<Promise<InOut>> = [];
        this._queue.forEach((queue) => {
            if (currentTime - queue.timestamp >= this._timeout) {
                // Merge node
                mergePromises.push(this.merge(Array.from(queue.frames.values()), queue.key as string));
                this._queue.delete(queue.key);
            }
        });
        Promise.all(mergePromises)
            .then((mergedFrames) => {
                const pushPromises: Array<Promise<void>> = [];
                mergedFrames.forEach((mergedFrame) => {
                    this.outputNodes.forEach((outputNode) => {
                        pushPromises.push(outputNode.push(mergedFrame));
                    });
                });
                return Promise.all(pushPromises);
            })
            .catch((ex) => {
                this.logger('error', ex);
            });
    }

    private _stop(): void {
        if (this._timer !== undefined) {
            clearInterval(this._timer);
        }
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const merge = this._mergeFn(frame);
            if (merge === undefined) {
                return resolve();
            }
            (Array.isArray(merge) ? merge : [merge]).forEach((key) => {
                let queue = this._queue.get(key);
                if (queue === undefined) {
                    queue = new QueuedMerge(key);
                    queue.frames.set(this._groupFn(frame), frame);
                    this._queue.set(key, queue);
                    resolve();
                } else {
                    queue.frames.set(this._groupFn(frame), frame);
                    // Check if there are enough frames
                    if (queue.frames.size >= this.inputNodes.length) {
                        this._queue.delete(key);
                        this.merge(Array.from(queue.frames.values()), key)
                            .then((mergedFrame) => {
                                resolve(mergedFrame);
                            })
                            .catch((ex) => {
                                reject(ex);
                            });
                    } else {
                        resolve();
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
    // eslint-ignore-next-line
    public merge(frames: InOut[], key?: string): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            const mergedFrame = frames[0];

            for (let i = 1; i < frames.length; i++) {
                const frame = frames[i];
                frame.getObjects().forEach((object) => {
                    if (mergedFrame.hasObject(object)) {
                        const existingObject = mergedFrame.getObjectByUID(object.uid);
                        // Merge object
                        object.relativePositions.forEach((value) => {
                            existingObject.addRelativePosition(value);
                        });
                        if (existingObject.getPosition() === undefined) {
                            existingObject.setPosition(object.getPosition());
                        } else if (existingObject.getPosition().accuracy < object.getPosition().accuracy) {
                            // TODO: Merge location using different tactic + check accuracy unit
                            existingObject.setPosition(object.getPosition());
                        }
                    } else {
                        // Add object
                        mergedFrame.addObject(object);
                    }
                });
                // Merge properties
                Object.keys(frame).forEach((propertyName) => {
                    const value = (mergedFrame as any)[propertyName];
                    if (value === undefined || value === null) {
                        (mergedFrame as any)[propertyName] = (frame as any)[propertyName];
                    }
                });
            }
            resolve(mergedFrame);
        });
    }
}

/**
 * Queued merge
 */
class QueuedMerge<InOut extends DataFrame> {
    public key: any;
    public frames: Map<any, InOut> = new Map();
    public timestamp: number;

    constructor(key: any) {
        this.key = key;
        this.timestamp = new Date().getTime();
    }
}
