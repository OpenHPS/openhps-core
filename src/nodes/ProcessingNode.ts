import { DataFrame } from "../data";
import { Node } from "../Node";

/**
 * Processing node
 */
export abstract class ProcessingNode<In extends DataFrame | DataFrame[], Out extends DataFrame | DataFrame[]> extends Node<In, Out> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises = new Array();
            const pushPromises = new Array();
            
            this.process(frame).then(result => {
                if (result === null || result === undefined) {
                    return resolve();
                } else if (result instanceof Array) {
                    
                } else {
                    const oldFrameService = this.findDataFrameService(frame as DataFrame);
                    const frameService = this.findDataFrameService(result as DataFrame);
                    
                    if (frameService !== null && frameService !== undefined) { 
                        if (frameService.name !== oldFrameService.name) {
                            // Delete frame from old service
                            servicePromises.push(oldFrameService.delete((frame as DataFrame).uid));
                        }
                        
                        // Update the frame
                        servicePromises.push(frameService.insert(result as DataFrame));
                    }
                }
                
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(result));
                });
            }).catch(ex => {
                if (ex === undefined) {
                    this.logger("warning", {
                        message: `Exception thrown in processing node ${this.uid} but no exception given!`
                    });
                }
                reject(ex);
            });

            // Push processed result to the next node
            Promise.all(servicePromises).then(() => {
                Promise.all(pushPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract process(frame: In): Promise<Out>;
}
