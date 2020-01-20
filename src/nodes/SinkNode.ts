import { Node } from "../Node";
import { GraphOptions } from "../graph/GraphOptions";
import { DataFrame } from "../data/DataFrame";
import { Model } from "../Model";
import { DataObject } from "../data";

export abstract class SinkNode<In extends DataFrame> extends Node<In, In> {

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
                    let service = model.findDataServiceByObject(object);
                    if (service === null || service === undefined) { 
                        service = defaultService;
                    }
                    if (object.uid !== null) {
                        servicePromises.push(service.update(object));
                    } else {
                        servicePromises.push(service.insert(object));
                    }
                }

                // Check if there are frame services
                let frameService = model.findDataServiceByName(data.constructor.name);
                if (frameService === null || frameService === undefined) { 
                   frameService = model.findDataServiceByName("DataFrame"); 
                }
              
                if (frameService !== null && frameService !== undefined) { 
                    servicePromises.push(frameService.update(data));
                }

                if (servicePromises.length === 0) {
                    resolve();
                } else {
                    Promise.all(servicePromises).then(_2 => {
                        resolve();
                    }).catch(ex => {
                        reject(ex);
                    });
                }
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract onPush(data: In, options?: GraphOptions): Promise<void>;

}
