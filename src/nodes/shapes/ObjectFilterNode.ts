import { DataFrame, DataObject } from '../../data';
import { ProcessingNode } from '../ProcessingNode';

export class ObjectFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (object: DataObject, frame?: DataFrame) => boolean;

    constructor(filterFn: (object: DataObject, frame?: DataFrame) => boolean) {
        super();
        this._filterFn = filterFn;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            for (const object of frame.getObjects()) {
                if (!this._filterFn(object, frame)) {
                    frame.removeObject(object);
                }
            }
            resolve(frame);
        });
    }
}
