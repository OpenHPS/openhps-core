import { DataFrame } from "../../../data/DataFrame";
import { FilterNode, FilterOptions } from "./FilterNode";

export class HPFilterNode<InOut extends DataFrame> extends FilterNode<InOut> {
    
    constructor(options: HPFilterOptions) {
        super(options);
    }

    public initFilter(value: number, options: HPFilterOptions): Promise<any> {
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
    
    public filter(value: number, filter: any): Promise<number> {
        return new Promise<number>((resolve, reject) => {
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
