import { PropertyFilterNode } from "./PropertyFilterNode";
import { FilterOptions } from "./FilterNode";
import { DataFrame, DataObject } from "../../../data";

export class HPFilterNode<InOut extends DataFrame> extends PropertyFilterNode<InOut> {
    
    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: HPFilterOptions) {
        super(objectFilter, propertySelector, options);
    }

    public initFilter<T extends number | number[]>(object: DataObject, value: T, options: HPFilterOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const rc = 1.0 / (options.cutOff * 2 * Math.PI);
            const dt = 1.0 / options.sampleRate;
            const alpha = rc / (rc + dt);

            resolve({
                x: value,
                y: value,
                alpha
            });
        });
    }
    
    public filter<T extends number | number[]>(object: DataObject, value: T, filter: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            filter.x = filter.alpha * (filter.x + value - filter.y);
            filter.y = value;
            resolve(filter.x);
        });
    }
}

export class HPFilterOptions extends FilterOptions {
    public sampleRate: number;
    public cutOff: number;
}
