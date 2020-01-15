import { DataFrame, DataObject } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { GraphPushOptions } from "../../graph";
import { Model } from "../../Model";

export class ServiceMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {

    constructor() {
        super();
    }

    public process(data: InOut, options: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const model = (this.getGraph() as Model<any, any>);
            const defaultService = model.getDataService(DataObject);
            const promises = new Array();
            data.getObjects(DataObject).forEach(object => {
                promises.push(new Promise((resolve, reject) => {
                    let service = model.getDataServiceByObject(object);
                    if (service === null || service === undefined) {
                        service = defaultService;
                    }
                    service.findById(object.getUID()).then(existingObject => {
                        existingObject.merge(object);
                        data.removeObject(object);
                        return service.update(existingObject);
                    }).then(savedObject => {
                        data.addObject(savedObject);
                        resolve();
                    }).catch(ex => {
                        reject(ex);
                    });
                }));
            });
            Promise.resolve(promises).then(_ => {
                resolve(data);
            });
        });
    }

}
