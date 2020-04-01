import { DataFrame } from "../data/DataFrame";
import { Model } from "../Model";
import { DataObject } from "../data";
import * as uuidv4 from 'uuid/v4';
import { AbstractSinkNode } from "./_internal/interfaces/AbstractSinkNode";

/**
 * Sink node
 */
export abstract class SinkNode<In extends DataFrame> extends AbstractSinkNode<In> {

    constructor() {
        super();
    }

    public push(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame === null || frame === undefined) {
                this.logger("warning", {
                    node: {
                        uid: this.uid,
                        name: this.name
                    },
                    message: `Sink node received null data frame!`,
                });
                return reject();
            }

            this.logger("debug", {
                node: {
                    uid: this.uid,
                    name: this.name
                },
                message: `Sink node received push`
            });

            this.onPush(frame).then(() => {
                const model: Model<any, any> = (this.graph as Model<any, any>);
                const defaultService = model.findDataService(DataObject);
                const servicePromises = new Array();

                const objects = new Array<DataObject>();
                frame.getObjects().forEach(object => {
                    objects.push(object);
                });

                for (const object of objects) {
                    // Check if current location needs to be updated
                    if (object.predictedLocations.length !== 0 && !object.hasNewLocation()) {
                        // Choose the predicted location with the best accuracy
                        object.currentLocation = object.predictedLocations[0];
                        for (let i = 1 ; i < object.predictedLocations.length ; i++) {
                            if (object.predictedLocations[i].accuracy < object.currentLocation.accuracy) {
                                object.currentLocation = object.predictedLocations[i];
                            }
                        }
                    }

                    let service = model.findDataServiceByObject(object);
                    if (service === null || service === undefined) { 
                        service = defaultService;
                    }
                    if (object.uid === null) {
                        object.uid = uuidv4();
                    }
                    servicePromises.push(service.insert(object));
                }

                // Check if there are frame services
                const frameService = this.getDataFrameService(frame);
                let framePromise: PromiseLike<void> = null;
                if (frameService !== null && frameService !== undefined) { 
                    // Update the frame
                    framePromise = frameService.delete(frame.uid);
                }

                Promise.all(servicePromises).then(() => {
                    if (framePromise !== null) {
                        Promise.resolve(framePromise).then(() => {
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
