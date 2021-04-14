import { PropertyFilterProcessingNode } from './PropertyFilterProcessingNode';
import { DataFrame, DataObject } from '../../../data';
import { Vector } from '../../../utils';
import { FilterProcessingOptions } from './FilterProcessingNode';

/**
 * @category Processing node
 */
export class LPFilterNode<InOut extends DataFrame> extends PropertyFilterProcessingNode<InOut> {
    constructor(propertySelector: (object: DataObject, frame?: InOut) => [any, PropertyKey], options: LPFilterOptions) {
        super(propertySelector, options);
    }

    public initFilter<T extends number | Vector>(object: DataObject, value: T, options: LPFilterOptions): Promise<any> {
        return new Promise<any>((resolve) => {
            let alpha = options.alpha;
            if (alpha === undefined) {
                const rc = 1.0 / (options.cutOff * 2 * Math.PI);
                const dt = 1.0 / options.sampleRate;
                alpha = dt / (rc + dt);
            }

            resolve({
                x: value,
                alpha,
            });
        });
    }

    public filter<T extends number | Vector>(
        object: DataObject,
        value: T,
        filter: { x: any; alpha: number },
    ): Promise<T> {
        return new Promise<T>((resolve) => {
            if (typeof value === 'number') {
                filter.x = filter.x + filter.alpha * (value - filter.x);
            } else {
                const vector = (value as Vector).clone();
                const filterVector = filter.x as Vector;
                filter.x = filterVector.add(vector.sub(filter.x).multiplyScalar(filter.alpha));
            }
            resolve(filter.x);
        });
    }
}

export interface LPFilterOptions extends FilterProcessingOptions {
    sampleRate: number;
    cutOff: number;
    alpha?: number;
}
