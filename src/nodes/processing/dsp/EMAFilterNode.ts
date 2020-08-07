import { PropertyFilterNode } from "./PropertyFilterNode";
import { FilterOptions } from "./FilterNode";
import { DataFrame, DataObject } from '../../../data';
import { Vector } from "../../../utils";

export class EMAFilterNode<InOut extends DataFrame> extends PropertyFilterNode<InOut> {
    
    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: EMAFilterOptions) {
        super(objectFilter, propertySelector, options);
    }

    public initFilter<T extends number | Vector>(object: DataObject, value: T, options: EMAFilterOptions): Promise<any> {
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
    
    public filter<T extends number | Vector>(object: DataObject, value: T, filter: { x: any, alpha: number }): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (typeof value === 'number') {
                filter.x = (filter.x * (1 - filter.alpha)) + (filter.alpha * value) as T;
            } else {
                const vector = value as Vector;
                const filterVector = filter.x as Vector;
                filter.x = filterVector.clone().multiplyScalar(1 - filter.alpha).add(vector.clone().multiplyScalar(filter.alpha)) as T;
            }
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
