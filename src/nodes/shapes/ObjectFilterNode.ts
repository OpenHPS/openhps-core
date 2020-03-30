import { DataFrame, DataObject } from "../../data";
import { GraphPushOptions } from "../../graph";
import { ProcessingNode } from "../ProcessingNode";

export class ObjectFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (object: DataObject) => boolean;

    constructor(filterFn: (object: DataObject) => boolean) {
        super();
        this._filterFn = filterFn;
    }

    public process(data: InOut, options: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const removedObjects = new Array();
            data.getObjects().forEach(object => {
                if (!this._filterFn(object)) {
                    removedObjects.push(object);
                }
            });
            removedObjects.forEach(object => {
                data.removeObject(object);
            });
            resolve(data);
        });
    }

}
