import { DataFrame } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { TimeUnit } from "../../utils";

export class FrameMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _queue: Map<Object, QueuedMerge<InOut>> = new Map();
    private _timeout: number;
    private _timeoutUnit: TimeUnit;
    private _timer: NodeJS.Timeout;
    private _mergeFn: (frame: InOut) => Object;
    private _groupFn: (frame: InOut) => Object;

    constructor(mergeFn: (frame: InOut) => Object, groupFn: (frame: InOut) => Object, timeout: number, timeoutUnit: TimeUnit) {
        super();
        this._mergeFn = mergeFn;
        this._timeout = timeout;
        this._timeoutUnit = timeoutUnit;
        this._groupFn = groupFn;

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
                        mergePromises.push(this.merge(Array.from(queue.frames.values())));
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

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const key = this._mergeFn(frame);
            if (key === undefined) {
                return resolve();
            }
            
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
                    this.merge(Array.from(queue.frames.values())).then(mergedFrame => {
                        resolve(mergedFrame);
                    }).catch(ex => {
                        reject(ex);
                    });
                } else {
                    resolve();
                }
            }
        });
    }

    public merge(frames: InOut[]): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const mergedFrame = frames[0];
            for (let i = 1; i < frames.length; i++) {
                const frame = frames[i];
                frame.getObjects().forEach(object => {
                    if (mergedFrame.hasObject(object)) {
                        // Merge object
                        const existingObject = mergedFrame.getObjectByUID(object.uid);
                        object.relativePositions.forEach(value => {
                            existingObject.addRelativePosition(value);
                        });
                        if (existingObject.getCurrentPosition() === undefined) {
                            existingObject.setCurrentPosition(object.getCurrentPosition());
                        } else if (existingObject.getCurrentPosition().accuracy < object.getCurrentPosition().accuracy) {
                            // TODO: Merge location using different tactic + check accuracy unit
                            existingObject.setCurrentPosition(object.getCurrentPosition());
                        }
                    } else {
                        // Add object
                        mergedFrame.addObject(object);
                    }
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
