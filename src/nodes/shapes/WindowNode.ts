import { DataFrame } from '../../data/DataFrame';
import { ProcessingNode, ProcessingNodeOptions } from '../ProcessingNode';

/**
 * Group key for frames that are not grouped explicitly.
 * @internal
 */
const DEFAULT_GROUP = 'default';

/**
 * Function that determines the window a frame belongs to.
 * @category Flow shape
 */
export type WindowGroupFunction<InOut extends DataFrame> = (frame: InOut) => string;

/**
 * Function that reduces the frames of a closed window to a single frame.
 * @category Flow shape
 */
export type WindowAggregateFunction<InOut extends DataFrame> = (frames: InOut[]) => InOut;

/**
 * Buffered frames of one group and the timestamp of its first frame.
 * @category Flow shape
 */
interface WindowBuffer<InOut extends DataFrame> {
    /**
     * Timestamp of the first frame in the window.
     */
    start: number;
    /**
     * Buffered frames, oldest first.
     */
    frames: InOut[];
}

/**
 * Options for a {@link WindowNode}.
 * @category Flow shape
 */
export interface WindowNodeOptions<InOut extends DataFrame = DataFrame> extends ProcessingNodeOptions {
    /**
     * Maximum number of frames in one window. The window closes as soon as it holds this many
     * frames.
     */
    windowCount?: number;
    /**
     * Maximum duration of one window in milliseconds, measured on the frame timestamps. A frame
     * that arrives this long after the first frame of the window starts the next window.
     */
    windowSize?: number;
    /**
     * Groups frames into independent windows. Frames with the same key are aggregated together.
     * Defaults to a single window for every frame.
     */
    groupBy?: WindowGroupFunction<InOut>;
    /**
     * Reduces the frames of a closed window to one frame. Defaults to merging the data objects of
     * all frames into the most recent frame.
     */
    aggregate?: WindowAggregateFunction<InOut>;
}

/**
 * Buffers frames per group and emits one aggregated frame per closed window.
 *
 * ## Usage
 *
 * ### Reducing a stream to windows
 * A window closes when it holds `windowCount` frames or when a frame arrives `windowSize`
 * milliseconds after the window's first frame. The frame that no longer fits the time window
 * starts the next one, so every frame is part of exactly one window. Frames of different
 * `groupBy` keys are buffered independently, which allows e.g. one window per asset.
 * ```typescript
 * import { ModelBuilder, WindowNode } from '@openhps/core';
 *
 * ModelBuilder.create()
 *     .from()
 *     .via(new WindowNode({
 *         windowSize: 5000,
 *         groupBy: (frame) => frame.source?.uid,
 *     }))
 *     .to(new CallbackSinkNode((frame) => console.log(frame.getObjects())))
 *     .build();
 * ```
 *
 * Unlike the data-service backed {@link BufferNode}, this node performs no storage: it holds the
 * frames in memory and releases them as one frame. The default aggregation merges the data
 * objects of all frames (the most recent frame's objects take precedence) and keeps the most
 * recent frame's source and timestamps. Pass `aggregate` for domain-specific reductions such as
 * a per-source median.
 *
 * Windows are driven by the frame timestamps (`phenomenonTimestamp`, falling back to
 * `createdTimestamp`), not wall-clock time, so replaying recorded frames produces the same
 * windows. Because of this, a partial window is only emitted when the next frame arrives; call
 * {@link flush} to emit it eagerly (for example when a model stops).
 * @category Flow shape
 */
export class WindowNode<InOut extends DataFrame = DataFrame> extends ProcessingNode<InOut, InOut> {
    declare protected options: WindowNodeOptions<InOut>;

    /**
     * Buffered frames and the timestamp of the first frame, per group.
     */
    private readonly windows = new Map<string, WindowBuffer<InOut>>();

    /**
     * Constructs a new window node.
     * @param options Window options, window size and aggregation
     */
    constructor(options: WindowNodeOptions<InOut> = {}) {
        super(options);
        this.options.name = options.name ?? 'window';
        if (this.options.windowSize === undefined && this.options.windowCount === undefined) {
            this.options.windowSize = 1000;
        }
    }

    /**
     * Buffers a frame and emits the aggregated frame of a window when it closes.
     * @param frame Data frame to buffer
     * @returns The aggregated frame of a closed window, or `undefined` while the window is open
     */
    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            if (frame === undefined) {
                resolve(undefined);
                return;
            }

            const key = this.options.groupBy !== undefined ? this.options.groupBy(frame) : DEFAULT_GROUP;
            const timestamp = frame.phenomenonTimestamp ?? frame.createdTimestamp;
            let window = this.windows.get(key);
            let closed: InOut;

            // A frame that no longer fits the time window belongs to the next window.
            if (
                window !== undefined &&
                this.options.windowSize !== undefined &&
                timestamp - window.start >= this.options.windowSize
            ) {
                closed = this._close(key, window);
                window = undefined;
            }

            if (window === undefined) {
                window = { start: timestamp, frames: [] };
                this.windows.set(key, window);
            }
            window.frames.push(frame);

            if (
                closed === undefined &&
                this.options.windowCount !== undefined &&
                window.frames.length >= this.options.windowCount
            ) {
                closed = this._close(key, window);
            }

            resolve(closed);
        });
    }

    /**
     * Emits the aggregated frame of every open window and starts with empty windows.
     * @returns The emitted frames, oldest window first
     */
    public flush(): Promise<InOut[]> {
        const aggregated = Array.from(this.windows.values()).map((window) => this._aggregate(window.frames));
        this.windows.clear();
        return Promise.all(
            aggregated.map((frame) => Promise.all(this.outlets.map((outlet) => outlet.push(frame))).then(() => frame)),
        );
    }

    /**
     * Discards all open windows without emitting them.
     */
    public reset(): void {
        this.windows.clear();
    }

    /**
     * Removes a window from the buffer and aggregates its frames.
     * @param key Group key of the window
     * @param window Window to close
     * @returns The aggregated frame
     */
    private _close(key: string, window: WindowBuffer<InOut>): InOut {
        this.windows.delete(key);
        return this._aggregate(window.frames);
    }

    /**
     * Aggregates the frames of one window.
     * @param frames Frames of the window, oldest first
     * @returns The aggregated frame
     */
    private _aggregate(frames: InOut[]): InOut {
        if (this.options.aggregate !== undefined) {
            return this.options.aggregate(frames);
        }

        // The most recent frame carries the newest source and timestamps; older objects fill the
        // gaps without overwriting objects that are already present.
        const result = frames[frames.length - 1];
        for (let i = frames.length - 2; i >= 0; i--) {
            frames[i].getObjects().forEach((object) => {
                if (result.getObjectByUID(object.uid) === undefined) {
                    result.addObject(object);
                }
            });
        }
        return result;
    }
}
