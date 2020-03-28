import { DataFrame, DataObject } from "../../data";
import { GraphPushOptions } from "../../graph";
import { TimeUnit } from "../../utils";
import { ProcessingNode } from "../ProcessingNode";

export class ObjectMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _queue: Map<Object, QueuedMerge<InOut>> = new Map();
    private _timeout: number;
    private _timeoutUnit: TimeUnit;
    private _timer: NodeJS.Timeout;
    private _groupFn: (frame: InOut) => Object;
    private _filterFn: (object: DataObject, frame?: InOut) => boolean;

    constructor(filterFn: (object: DataObject, frame?: InOut) => boolean, groupFn: (frame: InOut) => Object, timeout: number, timeoutUnit: TimeUnit) {
        super();
        this._timeout = timeout;
        this._timeoutUnit = timeoutUnit;
        this._groupFn = groupFn;
        this._filterFn = filterFn;

        this.once('build', this._start.bind(this));
        this.once('destroy', this._stop.bind(this));
    }

    /**
     * Start the timeout timer
     */
    private _start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._timer = setInterval(() => {
                const currentTime = new Date().getTime();
                const mergePromises = new Array();
                const removed = new Array();
                this._queue.forEach(queue => {
                    if (currentTime - queue.timestamp >= this._timeoutUnit.convert(this._timeout, TimeUnit.MILLI)) {
                        // Merge node
                        mergePromises.push(this.merge(Array.from(queue.frames.values()), queue.key as string));
                        removed.push(queue.key);
                    }
                });
                removed.forEach(remove => {
                    this._queue.delete(remove);
                });
                Promise.all(mergePromises).then(mergedFrames => {
                    const pushPromises = new Array();
                    mergedFrames.forEach(mergedFrame => {
                        this.outputNodes.forEach(outputNode => {
                            pushPromises.push(outputNode.push(mergedFrame));
                        });
                    });
                    Promise.all(pushPromises).then(() => {
                        
                    }).catch(ex => {
                        this.logger('error', ex);
                    });
                }).catch(ex => {
                    this.logger('error', ex);
                });
            }, this._timeoutUnit.convert(this._timeout, TimeUnit.MILLI));
            resolve();
            this.emit('ready');
        });
    }

    private _stop(): void {
        if (this._timer !== undefined) {
            clearInterval(this._timer);
        }
    }

    public process(frame: InOut, options: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            frame.getObjects().filter((value: DataObject) => this._filterFn(value, frame)).forEach(object => {
                const key = object.uid;

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
                        this.merge(Array.from(queue.frames.values()), key).then(mergedFrame => {
                            resolve(mergedFrame);
                        }).catch(ex => {
                            reject(ex);
                        });
                    } else {
                        resolve();
                    }
                }
            });
        });
    }

    public merge(frames: InOut[], objectUID: string): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const mergedFrame = frames[0];
            const existingObject = mergedFrame.getObjectByUID(objectUID);

            for (let i = 1; i < frames.length; i++) {
                const frame = frames[i];
                const object = frame.getObjectByUID(objectUID);
                
                // Merge object
                object.relativeLocations.forEach(value => {
                    existingObject.addRelativeLocation(value);
                });
                if (existingObject.currentLocation === undefined) {
                    existingObject.currentLocation = object.currentLocation;
                }
                object.predictedLocations.forEach(value => {
                    existingObject.addPredictedLocation(value);
                });

                // Merge properties
                Object.keys(frame).forEach(propertyName => {
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
    public key: Object;
    public frames: Map<Object, InOut> = new Map();
    public timestamp: number;

    constructor(key: Object) {
        this.key = key;
        this.timestamp = new Date().getTime();
    }

}
