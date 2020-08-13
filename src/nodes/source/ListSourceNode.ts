import { DataFrame } from "../../data/DataFrame";
import { SourceNode, SourceNodeOptions } from "../SourceNode";
import { DataObject } from "../../data";

/**
 * This source node is initialised with an array of data. This data
 * is popped when pulling from this node.
 */
export class ListSourceNode<Out extends DataFrame> extends SourceNode<Out> {
    private _inputData: Out[] = new Array();

    constructor(inputData: Out[], source?: DataObject, options?: SourceNodeOptions) {
        super(source, options);
        this._inputData = inputData;
    }

    public get inputData(): Out[] {
        return this._inputData;
    }

    public set inputData(inputData: Out[]) {
        this._inputData = inputData;
    }
    
    public get size(): number {
        return this._inputData.length;
    }

    public onPull(): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            if (this._inputData.length !== 0) {
                resolve(this._inputData.shift());
            }
            resolve(null);
        });
    }

}
