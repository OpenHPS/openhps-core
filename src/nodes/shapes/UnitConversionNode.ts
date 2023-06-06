import { DataFrame, DataObject } from '../../data';
import { ObjectProcessingNode, ObjectProcessingNodeOptions } from '../ObjectProcessingNode';
import { LengthUnit } from '../../utils';

/**
 * This node converts the positions of data objects inside the frame
 * to another unit.
 * @category Flow shape
 */
export class UnitConversionNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _unit: LengthUnit;

    constructor(unit: LengthUnit, options?: ObjectProcessingNodeOptions) {
        super(options);
        this._unit = unit;
    }

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve) => {
            const position = object.getPosition();

            if (position && position.unit !== this._unit) {
                position.fromVector(position.toVector3(this._unit));
                position.unit = this._unit;
                object.setPosition(position);
            }
            resolve(object);
        });
    }
}
