import { DataFrame, DataObject } from "../data";
import { ProcessingNode } from "./ProcessingNode";
import { GraphPushOptions } from "../graph";

export abstract class ObjectProcessingNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {

    constructor() {
        super();
    }

    public process(data: InOut, options?: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const processObjectPromises = new Array();
            data.getObjects().forEach(object => {
                processObjectPromises.push(this.processObject(object));
            });
            Promise.all(processObjectPromises).then(objects => {
                objects.forEach(object => {
                    data.addObject(object);
                });
                resolve(data);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract processObject(dataObject: DataObject): Promise<DataObject>;

}
