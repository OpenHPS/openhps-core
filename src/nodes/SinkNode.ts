import { DataFrame } from "../data/DataFrame";
import { Model } from "../Model";
import { DataObject } from "../data";
import { v4 as uuidv4 } from 'uuid';
import { AbstractSinkNode } from "../graph/interfaces/AbstractSinkNode";
import { DataService, DataObjectService } from "../service";

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

            this.logger("debug", {
                node: { uid: this.uid, name: this.name },
                message: `Sink node received push`
            });

            const model: Model<any, any> = (this.graph as Model<any, any>);
            const defaultService = model.findDataService(DataObject);
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
                let service = model.findDataService(object);
                if (service === null || service === undefined) { 
                    service = defaultService;
                }
                servicePromises.push(service.insert(object));
            }

            // Push the frame to the sink node
            this.onPush(frame).then(() => {
                // Remove the frame from the data frame service
                let frameService: DataService<any, any>;
                const framePromises: Array<PromiseLike<void>> = new Array();
                if (frame instanceof Array) {
                    frame.forEach((f: DataFrame) => {
                        // Check if there are frame services
                        frameService = model.findDataService(f);
                        if (frameService !== null && frameService !== undefined) { 
                            // Update the frame
                            framePromises.push(frameService.delete(f.uid));
                        }
                    });
                } else if (frame instanceof DataFrame) {
                    // Check if there are frame services
                    frameService = model.findDataService(frame);
                    if (frameService !== null && frameService !== undefined) { 
                        // Update the frame
                        framePromises.push(frameService.delete(frame.uid));
                    }
                }

                Promise.all(servicePromises).then(() => {
                    if (framePromises.length !== 0) {
                        Promise.all(framePromises).then(() => {
                            resolve();
                        }).catch(() => {
                            resolve(); // Ignore frame deleting issue
                        });
                    } else {
                        resolve();
                    }
                }).catch(ex => {
                    reject(ex);
                });
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract onPush(frame: In): Promise<void>;

}
