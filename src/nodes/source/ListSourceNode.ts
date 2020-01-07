import { DataFrame } from "../../data/DataFrame";
import { SourceNode } from "../SourceNode";
import { GraphPullOptions } from "../../utils";

export class ListSourceNode<Out extends DataFrame> extends SourceNode<Out> {
    private _inputData: Out[];

    constructor(inputData: Out[]) {
        super();
        this._inputData = inputData;
    }

    public onPull(options?: GraphPullOptions): void {
        if (this._inputData.length !== 0) {
            this.getOutputNodes().forEach(node => {
                node.push(this._inputData.pop(), options);
            });
        }
    }

}
