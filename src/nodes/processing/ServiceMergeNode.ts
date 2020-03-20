import { DataFrame, DataObject } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { GraphPushOptions } from "../../graph/GraphPushOptions";
import { Model } from "../../Model";

export class ServiceMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {

    constructor() {
        super();
    }

    public process(data: InOut, options: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const model = (this.graph as Model<any, any>);
            const defaultService = model.findDataService(DataObject);
            const promises = new Array();
            const objects = new Array<DataObject>();
            data.getObjects().forEach(object => {
                objects.push(object);
            });
            objects.forEach(object => {
                promises.push(new Promise((objResolve, objReject) => {
                    let service = model.findDataServiceByObject(object);
                    if (service === null || service === undefined) {
                        service = defaultService;
                    }
                    service.findByUID(object.uid).then(existingObject => {
                        if (existingObject === null) {
                            objResolve();
                        }

                        object.merge(existingObject);
                        if (data.source !== undefined && data.source.uid === existingObject.uid) {
                            data.source = object;
                        }
                        objResolve();
                    }).catch(ex => {
                        // Ignore
                        objResolve();
                    });
                }));
            });
            
            Promise.all(promises).then(_ => {
                resolve(data);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}
