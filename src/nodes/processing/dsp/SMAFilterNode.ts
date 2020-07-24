import * as math from 'mathjs';
import { PropertyFilterNode } from "./PropertyFilterNode";
import { FilterOptions } from "./FilterNode";
import { DataFrame, DataObject } from '../../../data';

export class SMAFilterNode<InOut extends DataFrame> extends PropertyFilterNode<InOut> {
    
    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: SMAFilterOptions) {
        super(objectFilter, propertySelector, options);
    }

    public initFilter(object: DataObject, value: number | number[], options: SMAFilterOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (options.taps < 1) {
                throw new Error(`Filter taps needs to be higher than 1!`);
            }
            
            resolve({
                x: [],
                taps: options.taps
            });
        });
    }
    
    public filter<T extends number | number[]>(object: DataObject, value: T, filter: { x: T[], taps: number }): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            filter.x.push(value);
            if (filter.x.length > filter.taps) {
                filter.x.shift();
            }
            let sum = filter.x[0];
            for (let i = 1 ; i < filter.x.length ; i++) {
                sum = math.add(sum, filter.x[i]) as T;
            }
            resolve(math.divide(sum, filter.taps) as T);
        });
    }
}

export class SMAFilterOptions extends FilterOptions {
    /**
     * Taps to keep
     */
    public taps: number;
}
