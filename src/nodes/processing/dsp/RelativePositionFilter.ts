import { DataFrame, DataObject, RelativePosition, RelativeRSSI } from '../../../data';
import { BKFilterNode, KalmanFilterOptions } from './BKFilterNode';

export class RelativePositionFilter<InOut extends DataFrame, R extends RelativePosition> extends BKFilterNode<InOut> {
    protected options: RelativePositionFilterOptions;
    private _relativePositionType: new () => R;

    constructor(relativePositionType: new () => R, options: RelativePositionFilterOptions) {
        super(undefined, options);
        this._relativePositionType = relativePositionType;
        this.options.minValue = this.options.minValue || 0;
        this.options.maxValue = this.options.maxValue || 100;
    }

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            Promise.all(
                object.relativePositions
                    .filter((x) => x instanceof this._relativePositionType)
                    .map((relPos: RelativeRSSI) => {
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
                        if (value <= this.options.maxValue) {
                            result[0]['referenceValue'] = Math.max(value, this.options.minValue);
                        } else {
                            object.removeRelativePositions(result[0].referenceObjectUID);
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
}
