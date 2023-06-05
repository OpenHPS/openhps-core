import { PropertyFilterProcessingNode, PropertyModifier, PropertySelector } from './PropertyFilterProcessingNode';
import { FilterProcessingOptions } from './FilterProcessingNode';
import { DataFrame, DataObject } from '../../../data';
import { Vector } from '../../../utils';

/**
 * @category Processing node
 */
export class SMAFilterNode<InOut extends DataFrame> extends PropertyFilterProcessingNode<InOut> {
    constructor(
        propertySelector: PropertySelector<InOut>,
        propertyModifier: PropertyModifier<InOut>,
        options: SMAFilterOptions,
    ) {
        super(propertySelector, propertyModifier, options);
    }

    initFilter(object: DataObject, value: number | Vector, options: SMAFilterOptions): Promise<any> {
        return new Promise<any>((resolve) => {
            if (options.taps < 1) {
                throw new Error(`Filter taps needs to be higher than 1!`);
            }

            resolve({
                x: [],
                taps: options.taps,
            });
        });
    }

    filter<T extends number | Vector>(
        object: DataObject,
        value: T,
        filter: { x: any[]; taps: number },
        options?: SMAFilterOptions,
    ): Promise<T> {
        return new Promise<T>((resolve) => {
            filter.x.push(value);
            if (filter.x.length > filter.taps) {
                filter.x.shift();
            } else if (options.minTaps && filter.x.length < options.minTaps) {
                resolve(value);
            }

            if (typeof value === 'number') {
                const sum = filter.x.reduce((a, b) => a + b);
                resolve((sum / filter.taps) as T);
            } else {
                const sum: Vector = filter.x[0].clone();
                for (let i = 1; i < filter.x.length; i++) {
                    sum.add(filter.x[i]);
                }
                resolve(sum.divideScalar(filter.taps) as T);
            }
        });
    }
}

export interface SMAFilterOptions extends FilterProcessingOptions {
    /**
     * Minimum number of taps to use
     * @default 1
     */
    minTaps?: number;
    /**
     * Taps to keep
     */
    taps: number;
}
