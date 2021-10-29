import { DataFrame, DataObject, RelativePosition } from '../../../data';
import { TimeService } from '../../../service/TimeService';
import { BKFilterNode, KalmanFilterOptions } from './BKFilterNode';

export class RelativePositionFilter<InOut extends DataFrame, R extends RelativePosition> extends BKFilterNode<InOut> {
    protected options: RelativePositionFilterOptions;
    private _relativePositionType: new () => R;

    constructor(relativePositionType: new () => R, options: RelativePositionFilterOptions) {
        super(undefined, options);
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
                        return this.filterValue(
                            object,
                            relPos,
                            `relativePositions.[${relPos.referenceObjectUID}]`,
                            relPos.referenceValue,
                        );
                    }),
            )
                .then((results: Array<[any, number]>) => {
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
    minValue?: number;
    maxValue?: number;
    maxTimeDifference?: number;
}
