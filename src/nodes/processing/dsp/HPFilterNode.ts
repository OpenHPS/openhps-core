import { FilterProcessingOptions } from './FilterProcessingNode';
import { DataFrame, DataObject } from '../../../data';
import { Vector } from '../../../utils';
import { PropertyFilterProcessingNode } from './PropertyFilterProcessingNode';

/**
 * @category Processing node
 */
export class HPFilterNode<InOut extends DataFrame> extends PropertyFilterProcessingNode<InOut> {
    constructor(propertySelector: (object: DataObject, frame?: InOut) => [any, PropertyKey], options: HPFilterOptions) {
        super(propertySelector, options);
    }

    public initFilter<T extends number | Vector>(
        object: DataObject,
        value: T,
        options: HPFilterOptions,
    ): Promise<{ x: T; y: T; alpha: number }> {
        return new Promise<any>((resolve) => {
            const rc = 1.0 / (options.cutOff * 2 * Math.PI);
            const dt = 1.0 / options.sampleRate;
            const alpha = rc / (rc + dt);

            resolve({
                x: value,
                y: value,
                alpha,
            });
        });
    }

    public filter<T extends number | Vector>(
        object: DataObject,
        value: T,
        filter: { x: any; y: any; alpha: number },
    ): Promise<T> {
        return new Promise<T>((resolve) => {
            if (typeof value === 'number') {
                filter.x = filter.alpha * (filter.x + value - filter.y);
                filter.y = value;
                resolve(filter.x);
            } else {
                filter.x = filter.x.add(value).sub(filter.y).multiplyScalar(filter.alpha);
                filter.y = value;
                resolve(filter.x);
            }
        });
    }
}

export interface HPFilterOptions extends FilterProcessingOptions {
    sampleRate: number;
    cutOff: number;
}
