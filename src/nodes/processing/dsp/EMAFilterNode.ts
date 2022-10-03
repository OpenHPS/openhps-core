import { DataFrame, DataObject } from '../../../data';
import { Vector } from '../../../utils';
import { PropertyFilterProcessingNode, PropertyModifier, PropertySelector } from './PropertyFilterProcessingNode';
import { FilterProcessingOptions } from './FilterProcessingNode';

/**
 * @category Processing node
 */
export class EMAFilterNode<InOut extends DataFrame> extends PropertyFilterProcessingNode<InOut> {
    constructor(
        propertySelector: PropertySelector<InOut>,
        propertyModifier: PropertyModifier<InOut>,
        options: EMAFilterOptions,
    ) {
        super(propertySelector, propertyModifier, options);
    }

    initFilter<T extends number | Vector>(object: DataObject, value: T, options: EMAFilterOptions): Promise<any> {
        return new Promise<any>((resolve) => {
            if (options.alpha > 1 || options.alpha < 0) {
                throw new Error(`Filter coefficient needs to be between 0 and 1!`);
            }

            resolve({
                x: value,
                alpha: options.alpha,
            });
        });
    }

    filter<T extends number | Vector>(object: DataObject, value: T, filter: { x: any; alpha: number }): Promise<T> {
        return new Promise<T>((resolve) => {
            if (typeof value === 'number') {
                filter.x = (filter.x * (1 - filter.alpha) + filter.alpha * value) as T;
            } else {
                const vector = value as Vector;
                const filterVector = filter.x as Vector;
                filter.x = filterVector
                    .clone()
                    .multiplyScalar(1 - filter.alpha)
                    .add(vector.clone().multiplyScalar(filter.alpha)) as T;
            }
            resolve(filter.x);
        });
    }
}

export interface EMAFilterOptions extends FilterProcessingOptions {
    /**
     * Filter coefficient [0,1]
     */
    alpha: number;
}
