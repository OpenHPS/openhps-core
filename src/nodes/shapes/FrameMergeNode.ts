import { AbsolutePosition, DataFrame, DataObject } from '../../data';
import { ProcessingNode } from '../ProcessingNode';
import { TimeUnit } from '../../utils';
import { TimeService } from '../../service';
import { PushOptions } from '../../graph';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';

/**
 * Merges two or more frames together based on a merge key.
 *
 * ## Usage
 * ```typescript
 * new FrameMergeNode();
 * ```
 */
export class FrameMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _queue: Map<any, QueuedMerge<InOut>> = new Map();
    private _timeout: number;
    private _timer: NodeJS.Timeout;
    private _mergeKeyFn: (frame: InOut, options?: PushOptions) => any;
    private _groupFn: (frame: InOut, options?: PushOptions) => any;
    protected options: FrameMergeOptions;

    constructor(
        mergeFn: (frame: InOut, options?: PushOptions) => any,
        groupFn: (frame: InOut, options?: PushOptions) => any,
        options?: FrameMergeOptions,
    ) {
        super(options);
        this._mergeKeyFn = mergeFn;
        this._groupFn = groupFn;

        this.options.timeout = this.options.timeout || 100;
        this.options.timeoutUnit = this.options.timeoutUnit || TimeUnit.MILLISECOND;
        this.options.objectFilter = this.options.objectFilter || (() => true);

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

            if (this._timeout > 0) {
                this._timer = setInterval(this._timerTick.bind(this), this._timeout);
            }
            resolve();
        });
    }

    private _timerTick(): void {
        const currentTime = TimeService.now();
        const mergePromises: Array<Promise<InOut>> = [];
        this._queue.forEach((queue) => {
            if (currentTime - queue.timestamp >= this._timeout && queue.frames.size >= this.options.minCount) {
                // Merge node
                mergePromises.push(this.merge(Array.from(queue.frames.values()), queue.key as string));
                this._queue.delete(queue.key);
                // Resolve pending promises
                queue.promises.forEach((fn) => {
                    fn(undefined);
                });
            }
        });
        Promise.all(mergePromises)
            .then((mergedFrames) => {
                const pushPromises: Array<Promise<void>> = [];
                mergedFrames.forEach((mergedFrame) => {
                    pushPromises.push(...this.outlets.map((outlet) => outlet.push(mergedFrame)));
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

    public process(frame: InOut, options?: PushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            if (this.inlets.length === 1) {
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
                    queue.frames.set(this._groupFn(frame, options), frame);
                    // Check if there are enough frames
                    if (queue.frames.size >= this.inlets.length) {
                        this._queue.delete(key);
                        this.merge(Array.from(queue.frames.values()), key)
                            .then(resolve)
                            .catch(reject)
                            .finally(() => {
                                queue.promises.forEach((fn) => {
                                    fn(undefined);
                                });
                            });
                    } else {
                        queue.promises.push(resolve);
                    }
                }
            });
        });
    }

    /**
     * Merge multiple data objects together
     *
     * @param {DataObject[]} objects Data objects
     * @returns {DataObject} Merged data object
     */
    public mergeObjects(objects: DataObject[]): DataObject {
        const baseObject = objects[0];

        // Relative positions
        for (let i = 1; i < objects.length; i++) {
            objects[i].getRelativePositions().forEach((relativePos) => {
                baseObject.addRelativePosition(relativePos);
            });
        }

        // Weighted position merging
        const positions = objects.map((object) => object.getPosition()).filter((position) => position !== undefined);
        if (positions.length === 0) {
            return baseObject;
        }
        let newPosition: AbsolutePosition = positions[0].clone();
        for (let i = 1; i < positions.length; i++) {
            newPosition = this.mergePositions(newPosition, positions[i].clone());
        }
        newPosition.accuracy = newPosition.accuracy / positions.length;
        if (newPosition.linearVelocity) {
            newPosition.linearVelocity.accuracy = newPosition.linearVelocity.accuracy / positions.length;
        }
        baseObject.setPosition(newPosition);
        return baseObject;
    }

    public mergePositions(positionA: AbsolutePosition, positionB: AbsolutePosition): AbsolutePosition {
        const newPosition = positionA;
        if (!positionB) {
            return newPosition;
        }

        // Accuracy of the two positions
        const posAccuracyA = positionA.accuracy || 1;
        const posAccuracyB = positionB.unit.convert(positionB.accuracy, positionA.unit) || 1;

        // Apply position merging
        newPosition.fromVector(
            newPosition
                .toVector3()
                .multiplyScalar(1 / posAccuracyA)
                .add(positionB.toVector3(newPosition.unit).multiplyScalar(1 / posAccuracyB)),
        );
        newPosition.fromVector(newPosition.toVector3().divideScalar(1 / posAccuracyA + 1 / posAccuracyB));
        newPosition.accuracy = 1 / (posAccuracyA + posAccuracyB);

        if (positionB.linearVelocity) {
            if (newPosition.linearVelocity) {
                const lvAccuracyA = newPosition.linearVelocity.accuracy || 1;
                const lvAccuracyB = positionB.linearVelocity.accuracy || 1;
                // Merge linear velocity
                newPosition.linearVelocity
                    .multiplyScalar(1 / lvAccuracyA)
                    .add(positionB.linearVelocity.multiplyScalar(1 / lvAccuracyB));
                newPosition.linearVelocity.divideScalar(1 / lvAccuracyA + 1 / lvAccuracyB);
                newPosition.linearVelocity.accuracy = 1 / (lvAccuracyA + lvAccuracyB);
            } else {
                newPosition.linearVelocity = positionB.linearVelocity;
            }
        }
        if (positionB.orientation) {
            if (newPosition.orientation) {
                newPosition.orientation.slerp(positionB.orientation, 0.5);
            } else {
                newPosition.orientation = positionB.orientation;
            }
        }
        // Average timestamp
        newPosition.timestamp = Math.round((positionA.timestamp + positionB.timestamp) / 2);
        return newPosition;
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
            const mergedObjects: Map<string, DataObject[]> = new Map();
            mergedFrame.getObjects().forEach((object) => {
                if (mergedObjects.get(object.uid)) {
                    mergedObjects.get(object.uid).push(object);
                } else {
                    mergedObjects.set(object.uid, [object]);
                }
            });

            for (let i = 1; i < frames.length; i++) {
                const frame = frames[i];
                frame.getObjects().forEach((object) => {
                    if (!mergedFrame.hasObject(object)) {
                        // Add object
                        mergedFrame.addObject(object);
                        mergedObjects.set(object.uid, [object]);
                    } else {
                        mergedObjects.get(object.uid).push(object);
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

            // Merge objects using the merging function
            mergedObjects.forEach((values) => {
                const mergedObject = this.mergeObjects(values);
                mergedFrame.addObject(mergedObject);
            });

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
    public promises: Array<(value: InOut) => void> = [];
    public timestamp: number;

    constructor(key: any) {
        this.key = key;
        this.timestamp = TimeService.now();
    }
}

export interface FrameMergeOptions extends ObjectProcessingNodeOptions {
    timeout?: number;
    timeoutUnit?: TimeUnit;
    minCount?: number;
}
