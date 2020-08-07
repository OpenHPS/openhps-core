import { PropertyFilterNode } from "./PropertyFilterNode";
import { FilterOptions } from "./FilterNode";
import { DataFrame, DataObject } from '../../../data';
import { Vector } from "../../../utils";

export class LPFilterNode<InOut extends DataFrame> extends PropertyFilterNode<InOut> {
    
    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: LPFilterOptions) {
        super(objectFilter, propertySelector, options);
    }

    public initFilter<T extends number | Vector>(object: DataObject, value: T, options: LPFilterOptions): Promise<any> {
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
    
    public filter<T extends number | Vector>(object: DataObject, value: T, filter: { x: any, alpha: number }): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (typeof value === 'number') {
                filter.x = filter.x + (filter.alpha * (value - filter.x));
            } else {
                const vector = value as Vector;
                const filterVector = filter.x as Vector;
                filter.x = filterVector.add(vector.sub(filter.x).multiplyScalar(filter.alpha));
            }
            resolve(filter.x);
        });
    }
}

export class LPFilterOptions extends FilterOptions {
    public sampleRate: number;
    public cutOff: number;
}
