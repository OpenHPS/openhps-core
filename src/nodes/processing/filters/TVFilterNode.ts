import { DataFrame } from "../../../data/DataFrame";
import { FilterNode, FilterOptions } from "./FilterNode";
import * as math from 'mathjs';

/**
 * Total Variation Filter
 * @paper http://www.ccom.ucsd.edu/~peg/papers/ALvideopaper.pdf
 */
export class TVFilterNode<InOut extends DataFrame> extends FilterNode<InOut> {
    
    constructor(options: TVFilterOptions, properties?: string[]) {
        super(options, properties);
    }

    public initFilter(value: number, options: TVFilterOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
           

            resolve({
           
            });
        });
    }
    
    public filter(value: number, filter: any): Promise<number> {
        return new Promise<number>((resolve, reject) => {
  
            resolve(filter.x);
        });
    }
}

export class TVFilterOptions extends FilterOptions {

}
