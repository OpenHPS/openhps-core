import { DataFrame } from "../../data/DataFrame";
import { SourceNode } from "../SourceNode";
import { GraphPullOptions } from "../../utils";

/**
 * This source node is initialised with an array of data. This data
 * is popped when pulling from this node.
 */
export class ListSourceNode<Out extends DataFrame> extends SourceNode<Out> {
    private _inputData: Out[];

    constructor(inputData: Out[]) {
        super();
        this._inputData = inputData;
    }

    public onPull(options?: GraphPullOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            if (this._inputData.length !== 0) {
                resolve(this._inputData.pop());
            }
            resolve(null);
        });
    }

}
