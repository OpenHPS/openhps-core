import { DataFrame } from "../../data";
import { GraphPushOptions } from "../../graph";
import { ProcessingNode } from "../ProcessingNode";
import { TimeUnit } from "../../utils";

/**
 * Source merge node. This node merges the data frames from multiple sources into one.
 * 
 * ## Usage
 * Merging is done by determining the incoming edges, once the amount of received frames from unique sources is
 * the same as the incoming edges, the frames are merged and pushed.
 * 
 * It is possible to set a timeout, when this timeout is reached the frames that are received are merged and pushed.
 * 
 * When frames of the same source are received they are overridden.
 * 
 * @todo memory leak with dataframservice
 */
export class SourceMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _frameBuffer: Map<String, InOut> = new Map();
    private _timeout: number;
    private _timeoutUnit: TimeUnit;
    private _timer: NodeJS.Timeout;

    constructor(timeout: number, timeoutUnit: TimeUnit) {
        super();
        this._timeout = timeout;
        this._timeoutUnit = timeoutUnit;

        this.on('build', this._start.bind(this));
    }

    /**
     * Start the timeout timer
     */
    private _start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._timer = setInterval(() => {
                if (this._frameBuffer.size !== 0) {
                    const pushPromises = new Array();
                    const mergedFrame = this._merge();
                    this.outputNodes.forEach(node => {
                        pushPromises.push(node.push(mergedFrame));
                    });
                    Promise.all(pushPromises).then(_2 => {
                        resolve();
                    }).catch(ex => {
                        reject(ex);
                    });
                }
            }, this._timeoutUnit.convert(this._timeout, TimeUnit.MILLI));
            resolve();
        });
    }

    public process(data: InOut, options: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            if (data.source === undefined) {
                return resolve();
            }

            this._frameBuffer.set(data.source.uid, data);
            if (this._frameBuffer.size >= this.inputNodes.length) {
                this._timer.refresh();
                resolve(this._merge());
            } else {
                resolve();
            }
        });
    }

    private _merge(): InOut {
        // Ready to merge
        const frames = Array.from(this._frameBuffer.values());
        const mergedFrame = frames[0];
        for (let i = 1; i < this._frameBuffer.size; i++) {
            const frame = frames[i];
            frame.getObjects().forEach(object => {
                if (mergedFrame.hasObject(object)) {
                    // Merge object
                    const existingObject = mergedFrame.getObjectByUID(object.uid);
                    object.relativeLocations.forEach(value => {
                        existingObject.addRelativeLocation(value);
                    });
                } else {
                    // Add object
                    mergedFrame.addObject(object);
                }
            });
        }
        this._frameBuffer = new Map();
        return mergedFrame;
    }

}
