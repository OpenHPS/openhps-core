import { GraphOptions } from "../graph/GraphOptions";
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

    public push(data: In, options?: GraphOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPush(data, options).then(_1 => {
                const model: Model<any, any> = (this.graph as Model<any, any>);
                const defaultService = model.findDataService(DataObject);
                const servicePromises = new Array();
                const objects = new Array<DataObject>();
                data.getObjects().forEach(object => {
                    objects.push(object);
                });
                if (data.source !== undefined)
                    objects.push(data.source);

                for (const object of objects) {
                    // Check if current location needs to be updated
                    if (object.predictedLocations.length !== 0 && (object.hasNewLocation() || object.currentLocation === undefined)) {
                        // Choose the predicted location with the best accuracy
                        object.currentLocation = object.predictedLocations[0];
                    }

                    let service = model.findDataServiceByObject(object);
                    if (service === null || service === undefined) { 
                        service = defaultService;
                    }
                    if (object.uid === null) {
                        object.uid = uuidv4();
                    }
                    servicePromises.push(service.insert(object.uid, object));
                }

                // Check if there are frame services
                const frameService = this.getDataFrameService(data);
                let framePromise: PromiseLike<void> = null;
                if (frameService !== null && frameService !== undefined) { 
                    // Update the frame
                    framePromise = frameService.delete(data.uid);
                }

                Promise.all(servicePromises).then(_2 => {
                    if (framePromise !== null) {
                        Promise.resolve(framePromise).then(_ => {
                            resolve();
                        }).catch(_ => {
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

    public abstract onPush(data: In, options?: GraphOptions): Promise<void>;

}
