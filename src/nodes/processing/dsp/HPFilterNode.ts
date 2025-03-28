import { FilterProcessingOptions } from './FilterProcessingNode';
import { DataFrame, DataObject } from '../../../data';
import { Vector2, Vector3 } from '../../../utils';
import { PropertyFilterProcessingNode, PropertyModifier, PropertySelector } from './PropertyFilterProcessingNode';

/**
 * @category Processing node
 */
export class HPFilterNode<InOut extends DataFrame> extends PropertyFilterProcessingNode<InOut> {
    constructor(
        propertySelector: PropertySelector<InOut>,
        propertyModifier: PropertyModifier<InOut>,
        options: HPFilterOptions,
    ) {
        super(propertySelector, propertyModifier, options);
    }

    initFilter<T extends number | Vector2 | Vector3>(
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

    filter<T extends number | Vector2 | Vector3>(
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
                filter.x = filter.x.clone().add(value).sub(filter.y).multiplyScalar(filter.alpha);
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
