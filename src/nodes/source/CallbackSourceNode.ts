import { DataFrame } from "../../data/DataFrame";
import { SourceNode } from "../SourceNode";

export class CallbackSourceNode<Out extends DataFrame> extends SourceNode<Out> {
    private _callback: () => Out;

    constructor(callback: () => Out = function() { return null; }) {
        super(null);
        this._callback = callback;
    }
    
    public get callback(): () => Out {
        return this._callback;
    }

    public set callback(callback: () => Out) {
        this._callback = callback;
    }

    public onPull(): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            resolve(this.callback());
        });
    }
    
} 
