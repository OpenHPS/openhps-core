import { DataFrame } from "../../data/DataFrame";
import { GraphPullOptions } from "../../graph/GraphPullOptions";
import { SourceNode } from "../SourceNode";

export class CallbackSourceNode<Out extends DataFrame> extends SourceNode<Out> {
    private _callback: (options?: GraphPullOptions) => Out;

    constructor(callback: (options?: GraphPullOptions) => Out = function() { return null; }) {
        super(null);
        this._callback = callback;
    }
    
    public get callback(): (options?: GraphPullOptions) => Out {
        return this._callback;
    }

    public set callback(callback: (options?: GraphPullOptions) => Out) {
        this._callback = callback;
    }

    public onPull(options?: GraphPullOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            resolve(this.callback(options));
        });
    }
    
} 
