import * as math from 'mathjs';
import { PropertyFilterNode } from "./PropertyFilterNode";
import { FilterOptions } from "./FilterNode";
import { DataFrame, DataObject } from '../../../data';

export class EMAFilterNode<InOut extends DataFrame> extends PropertyFilterNode<InOut> {
    
    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: EMAFilterOptions) {
        super(objectFilter, propertySelector, options);
    }

    public initFilter<T extends number | number[]>(object: DataObject, value: T, options: EMAFilterOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (options.alpha > 1 || options.alpha < 0) {
                throw new Error(`Filter coefficient needs to be between 0 and 1!`);
            }

            resolve({
                x: value,
                alpha: options.alpha
            });
        });
    }
    
    public filter<T extends number | number[]>(object: DataObject, value: T, filter: { x: T, alpha: number }): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            filter.x = math.add(math.multiply(1 - filter.alpha, filter.x), math.multiply(filter.alpha, value)) as T;
            resolve(filter.x);
        });
    }
}

export class EMAFilterOptions extends FilterOptions {
    /**
     * Filter coefficient [0,1]
     */
    public alpha: number;
}
