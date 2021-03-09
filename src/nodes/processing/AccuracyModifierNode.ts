import { DataFrame, DataObject } from '../../data';
import { ObjectProcessingNode, ObjectProcessingNodeOptions } from '../ObjectProcessingNode';

/**
 * Accuracy modifier node. Apply an offset of magnitude to the position accuracy.
 *
 * @category Processing node
 */
export class AccuracyModifierNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    protected options: AccuracyModifierOptions;

    constructor(options?: AccuracyModifierOptions) {
        super(options);
    }

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise((resolve) => {
            if (object.position) {
                object.position.accuracy = object.position.accuracy * this.options.magnitude + this.options.offset;
            }
            resolve(object);
        });
    }
}

export interface AccuracyModifierOptions extends ObjectProcessingNodeOptions {
    offset?: number;
    magnitude?: number;
}
