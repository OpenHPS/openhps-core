import { PropertyFilterProcessingNode } from "./PropertyFilterProcessingNode";
import { FilterProcessingOptions } from "./FilterProcessingNode";
import { DataFrame, DataObject } from '../../../data';
import { Vector } from "../../../utils";

export class SMAFilterNode<InOut extends DataFrame> extends PropertyFilterProcessingNode<InOut> {
    
    constructor(propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: SMAFilterOptions) {
        super(propertySelector, options);
    }

    public initFilter(object: DataObject, value: number | Vector, options: SMAFilterOptions): Promise<any> {
        return new Promise<any>(resolve => {
            if (options.taps < 1) {
                throw new Error(`Filter taps needs to be higher than 1!`);
            }
            
            resolve({
                x: [],
                taps: options.taps
            });
        });
    }
    
    public filter<T extends number | Vector>(object: DataObject, value: T, filter: { x: any[]; taps: number }): Promise<T> {
        return new Promise<T>(resolve => {
            filter.x.push(value);
            if (filter.x.length > filter.taps) {
                filter.x.shift();
            }

            if (typeof value === 'number') {
                let sum: number = filter.x[0];
                for (let i = 1 ; i < filter.x.length ; i++) {
                    sum = sum + filter.x[i];
                }
                resolve(sum / filter.taps as T);
            } else {
                const sum: Vector = filter.x[0];
                for (let i = 1 ; i < filter.x.length ; i++) {
                    sum.add(filter.x[i]);
                }
                resolve(sum.divideScalar(filter.taps) as T);
            }
        });
    }
}

export interface SMAFilterOptions extends FilterProcessingOptions {
    /**
     * Taps to keep
     */
    taps: number;
}
