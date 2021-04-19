import { DataFrame, DataObject, RelativeDistance } from '../../../data';
import { BKFilterNode, KalmanFilterOptions } from './BKFilterNode';

export class RelativeDistanceFilter<InOut extends DataFrame> extends BKFilterNode<InOut> {
    protected options: RelativeDistanceFilterOptions;

    constructor(options: RelativeDistanceFilterOptions) {
        super(undefined, options);
        this.options.minDistance = this.options.minDistance || 0;
        this.options.maxDistance = this.options.maxDistance || Infinity;
    }

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            Promise.all(
                object.relativePositions
                    .filter((x) => x instanceof RelativeDistance)
                    .map((relPos) => {
                        return this.filterValue(object, relPos, 'distance', relPos['distance']);
                    }),
            )
                .then((results: Array<[any, number]>) => {
                    results.forEach((result) => {
                        const value = result[1];
                        if (value <= this.options.maxDistance) {
                            result[0]['distance'] = Math.max(value, this.options.minDistance);
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

export interface RelativeDistanceFilterOptions extends KalmanFilterOptions {
    minDistance?: number;
    maxDistance?: number;
}
