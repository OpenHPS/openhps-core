import { DataFrame } from "../../../data/DataFrame";
import { FilterNode, FilterOptions } from "./FilterNode";

export class LPFilterNode<InOut extends DataFrame> extends FilterNode<InOut> {
    
    constructor(options: LPFilterOptions) {
        super(options);
    }

    public initFilter(value: number, options: LPFilterOptions): Promise<any> {
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
    
    public filter(value: number, filter: any): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            filter.x = filter.x + (filter.alpha * (value - filter.x));
            resolve(filter.x);
        });
    }
}

export class LPFilterOptions extends FilterOptions {
    public sampleRate: number;
    public cutOff: number;
}
