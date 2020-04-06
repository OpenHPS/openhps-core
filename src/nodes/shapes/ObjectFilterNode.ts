import { DataFrame, DataObject } from "../../data";
import { ProcessingNode } from "../ProcessingNode";

export class ObjectFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (object: DataObject, frame?: DataFrame) => boolean;

    constructor(filterFn: (object: DataObject, frame?: DataFrame) => boolean) {
        super();
        this._filterFn = filterFn;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const removedObjects = new Array();
            frame.getObjects().forEach(object => {
                if (!this._filterFn(object, frame)) {
                    removedObjects.push(object);
                }
            });
            removedObjects.forEach(object => {
                frame.removeObject(object);
            });
            resolve(frame);
        });
    }

}
