import { DataFrame } from "../data";
import { Node } from "../Node";
import { GraphPushOptions } from "../graph/GraphPushOptions";

/**
 * Processing node
 */
export abstract class ProcessingNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.process(data, options).then(result => {
                if (result !== null && result !== undefined) {
                    const servicePromises = new Array();

                    const oldFrameService = this.getDataFrameService(data);
                    const frameService = this.getDataFrameService(result);
                    
                    if (frameService !== null && frameService !== undefined) { 
                        if (frameService.getName() !== oldFrameService.getName()) {
                            // Delete frame from old service
                            servicePromises.push(oldFrameService.delete(data.uid));
                        }
                      
                        // Update the frame
                        servicePromises.push(frameService.update(result));
                    }

                    // Push processed result to the next node
                    Promise.all(servicePromises).then(_1 => {
                        const pushPromises = new Array();
                        this.outputNodes.forEach(node => {
                            pushPromises.push(node.push(result, options));
                        });
                        Promise.all(pushPromises).then(_2 => {
                            resolve();
                        }).catch(ex => {
                            reject(ex);
                        });
                    }).catch(ex => {
                        reject(ex);
                    });
                } else {
                    resolve();
                }
            }).catch(ex => {
                if (ex === undefined) {
                    this.logger("warning", {
                        message: `Exception thrown in processing node ${this.uid} but no exception given!`
                    });
                }
                reject(ex);
            });
        });
    }

    public abstract process(data: In, options: GraphPushOptions): Promise<Out>;
}
