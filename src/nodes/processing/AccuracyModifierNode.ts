import { DataFrame, DataObject } from '../../data';
import { LengthUnit } from '../../utils';
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
        this.options.offsetUnit = this.options.offsetUnit || LengthUnit.METER;
        this.options.offset = this.options.offset || 0;
        this.options.magnitude = this.options.magnitude || 1;
    }

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise((resolve) => {
            if (object.position) {
                if (this.options.value) {
                    object.position.accuracy.setValue(
                        LengthUnit.METER.convert(this.options.value, object.position.unit),
                    );
                } else {
                    const accuracy = object.position.accuracy.valueOf() || this.options.defaultValue;
                    if (accuracy) {
                        const offset = this.options.offsetUnit.convert(this.options.offset, object.position.unit);
                        object.position.accuracy.setValue(accuracy * this.options.magnitude + offset);
                    }
                }
            }
            resolve(object);
        });
    }
}

export interface AccuracyModifierOptions extends ObjectProcessingNodeOptions {
    /**
     * Offset to add to the accuracy
     */
    offset?: number;
    /**
     * Offset unit to use for the offset
     *
     * @default LengthUnit.METER
     */
    offsetUnit?: LengthUnit;
    /**
     * Magnitude of the accuracy
     */
    magnitude?: number;
    /**
     * Default value when no accuracy on position.
     */
    defaultValue?: number;
    /**
     * Fixed value
     */
    value?: number;
}
