import { DataFrame, DataObject } from "../data";
import { ProcessingNode } from "./ProcessingNode";
import { GraphPushOptions } from "../graph";

/**
 * Processing node that processes each [[DataObject]] in a [[DataFrame]] individually
 */
export abstract class ObjectProcessingNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filter: Array<new () => any>;

    constructor(filter?: Array<new () => any>) {
        super();
        this._filter = filter;
    }

    public process(data: InOut, options?: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const processObjectPromises = new Array();
            if (this._filter === undefined) {
                data.getObjects().forEach(object => {
                    processObjectPromises.push(this.processObject(object));
                });
            } else {
                data.getObjects().forEach(object => {
                    this._filter.forEach(dataType => {
                        if (object instanceof dataType) {
                            processObjectPromises.push(this.processObject(object));
                        }
                    });
                });
            }
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
