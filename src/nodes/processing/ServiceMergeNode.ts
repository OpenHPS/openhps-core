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
            data.getObjects(DataObject).forEach(object => {
                const service = model.getDataServiceByObject(object);
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
            });
        });
    }

}
