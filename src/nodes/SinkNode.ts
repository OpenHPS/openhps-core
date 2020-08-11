import { DataFrame } from "../data/DataFrame";
import { Model } from "../Model";
import { DataObject } from "../data";
import { v4 as uuidv4 } from 'uuid';
import { AbstractSinkNode } from "../graph/interfaces/AbstractSinkNode";
import { DataService } from "../service";

/**
 * Sink node
 */
export abstract class SinkNode<In extends DataFrame | DataFrame[] = DataFrame> extends AbstractSinkNode<In> {

    constructor() {
        super();
    }

    public push(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame === null || frame === undefined) {
                this.logger("warning", {
                    node: { uid: this.uid, name: this.name },
                    message: `Sink node received null data frame!`,
                });
                return reject();
            }

            const persistObjectPromise = this.persistDataObject(frame);

            // Push the frame to the sink node
            this.onPush(frame).then(() => {
                const persistFramePromise = this.persistDataFrame(frame);
                return Promise.all([persistObjectPromise, persistFramePromise]);
            }).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    protected persistDataFrame(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const model: Model<any, any> = (this.graph as Model<any, any>);
            const servicePromises = new Array();

            // Remove the frame from the data frame service
            let frameService: DataService<any, any>;
            if (frame instanceof Array) {
                frame.forEach((f: DataFrame) => {
                    // Check if there are frame services
                    frameService = model.findDataService(f);
                    if (frameService !== null && frameService !== undefined) { 
                        // Update the frame
                        servicePromises.push(frameService.delete(f.uid));
                    }
                });
            } else if (frame instanceof DataFrame) {
                // Check if there are frame services
                frameService = model.findDataService(frame);
                if (frameService !== null && frameService !== undefined) { 
                    // Update the frame
                    servicePromises.push(frameService.delete(frame.uid));
                }
            }

            Promise.all(servicePromises).then(() => {
                resolve();
            }).catch(() => {
                resolve(); // Ignore frame deleting issue
            });
        });
    }

    protected persistDataObject(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const model: Model<any, any> = (this.graph as Model<any, any>);
            const servicePromises = new Array();

            const objects = new Array<DataObject>();
            if (frame instanceof Array) {
                frame.forEach((f: DataFrame) => {
                    f.getObjects().forEach(object => {
                        objects.push(object);
                    });
                });
            } else {
                (frame as DataFrame).getObjects().forEach(object => {
                    objects.push(object);
                });
            }

            for (const object of objects) {
                if (object.uid === null) {
                    object.uid = uuidv4();
                }

                // Queue the storage of the object in a data service
                const service = model.findDataService(object);
                servicePromises.push(service.insert(object.uid, object));
            }

            Promise.all(servicePromises).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract onPush(frame: In): Promise<void>;

}
