import { DataFrame, DataObject } from '../../data';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';
import { ProcessingNode } from '../ProcessingNode';

export class ObjectFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    protected options: ObjectProcessingNodeOptions;

    constructor(filterFn: (object: DataObject, frame?: DataFrame) => boolean, options?: ObjectProcessingNodeOptions) {
        super(options);
        this.options.objectFilter = this.options.objectFilter || filterFn;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            frame
                .getObjects()
                .filter((object) => !this.options.objectFilter(object, frame))
                .forEach(frame.removeObject);
            resolve(frame);
        });
    }
}
