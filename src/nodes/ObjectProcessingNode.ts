import { DataFrame, DataObject } from "../data";
import { ProcessingNode } from "./ProcessingNode";
import { isFunction } from "util";

/**
 * Processing node that processes each [[DataObject]] in a [[DataFrame]] individually
 */
export abstract class ObjectProcessingNode<InOut extends DataFrame = DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (object: DataObject, frame?: InOut) => boolean = (object: DataObject) => true;

    constructor(filterFn?: (object: DataObject, frame?: InOut) => boolean) {
        super();

        if (isFunction(filterFn)) {
            this._filterFn = filterFn;
        }
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const processObjectPromises = new Array();
            frame.getObjects().filter(value => this._filterFn(value, frame)).forEach(object => {
                processObjectPromises.push(this.processObject(object, frame));
            });
            Promise.all(processObjectPromises).then(objects => {
                objects.forEach(object => {
                    frame.addObject(object);
                });
                resolve(frame);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract processObject(dataObject: DataObject, dataFrame?: InOut): Promise<DataObject>;

}
