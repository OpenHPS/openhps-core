import * as math from 'mathjs';
import { PropertyFilterNode } from "./PropertyFilterNode";
import { FilterOptions } from "./FilterNode";
import { DataFrame, DataObject } from '../../../data';

export class LPFilterNode<InOut extends DataFrame> extends PropertyFilterNode<InOut> {
    
    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: LPFilterOptions) {
        super(objectFilter, propertySelector, options);
    }

    public initFilter<T extends number | number[]>(object: DataObject, value: T, options: LPFilterOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const rc = 1.0 / (options.cutOff * 2 * Math.PI);
            const dt = 1.0 / options.sampleRate;
            const alpha = dt / (rc + dt);

            resolve({
                x: value,
                alpha
            });
        });
    }
    
    public filter<T extends number | number[]>(object: DataObject, value: T, filter: { x: T, alpha: number }): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            filter.x = math.add(filter.x, math.multiply(filter.alpha, math.subtract(value, filter.x))) as T;
            resolve(filter.x);
        });
    }
}

export class LPFilterOptions extends FilterOptions {
    public sampleRate: number;
    public cutOff: number;
}
