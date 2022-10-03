import { DataFrame, DataObject, RelativePosition } from '../../../data';
import { TimeService } from '../../../service/TimeService';
import { Vector3 } from '../../../utils';
import { BKFilterNode, KalmanFilterOptions } from './BKFilterNode';

/**
 * Relative position filter to filter the relative positions of an object depending on criteria
 */
export class RelativePositionFilter<InOut extends DataFrame, R extends RelativePosition> extends BKFilterNode<InOut> {
    protected options: RelativePositionFilterOptions;
    private _relativePositionType: new () => R;

    constructor(relativePositionType: new () => R, options: RelativePositionFilterOptions) {
        super(undefined, undefined, options);
        this._relativePositionType = relativePositionType;
        this.options.minValue = this.options.minValue || 0;
        this.options.maxValue = this.options.maxValue || 100;
        this.options.maxTimeDifference = this.options.maxTimeDifference || Infinity;
    }

    processObject(object: DataObject): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            Promise.all(
                object.relativePositions
                    .filter((x) => x instanceof this._relativePositionType)
                    .map((relPos: RelativePosition) => {
                        return this.filterValue(object, relPos.referenceValue);
                    }),
            )
                .then((results: Array<number | Vector3>) => {
                    results.forEach((result) => {
                        const value = result[1];
                        const relativePosition = result[0];
                        if (
                            value <= this.options.maxValue &&
                            value >= this.options.minValue &&
                            TimeService.now() - this.options.maxTimeDifference <= relativePosition.timestamp
                        ) {
                            relativePosition.referenceValue = value;
                        } else {
                            object.removeRelativePositions(relativePosition.referenceObjectUID);
                        }
                    });
                    resolve(object);
                })
                .catch(reject);
        });
    }
}

export interface RelativePositionFilterOptions extends KalmanFilterOptions {
    /**
     * Minimum value of a relative position. If the value is not reached,
     * it is removed from the object.
     */
    minValue?: number;
    /**
     * Maximum value of a relative position
     */
    maxValue?: number;
    /**
     * Maximum time different between the current time and the timestamp
     * of the relative position.
     */
    maxTimeDifference?: number;
}
