import { DataFrame, DataObject } from "../data";
import { ProcessingNode } from "./ProcessingNode";
import { GraphPushOptions } from "../graph";
import { isFunction } from "util";

/**
 * Processing node that processes each [[DataObject]] in a [[DataFrame]] individually
 */
export abstract class ObjectProcessingNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (object: DataObject, frame?: InOut) => boolean = (object: DataObject) => true;

    constructor(filterFn?: (object: DataObject, frame?: InOut) => boolean) {
        super();

        if (isFunction(filterFn)) {
            this._filterFn = filterFn;
        }
    }

    public process(data: InOut, options?: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const processObjectPromises = new Array();
            data.getObjects().filter(value => this._filterFn(value, data)).forEach(object => {
                processObjectPromises.push(this.processObject(object, data));
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

    public abstract processObject(dataObject: DataObject, dataFrame?: InOut): Promise<DataObject>;

}
