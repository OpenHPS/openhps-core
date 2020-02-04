import { DataFrame } from "../../data/DataFrame";
import { SinkNode } from "../SinkNode";
import { GraphPushOptions } from "../../graph/GraphPushOptions";

export class CallbackSinkNode<In extends DataFrame> extends SinkNode<In> {
    private _callback: (data: In, options?: GraphPushOptions) => void;

    constructor(callback: (data: In, options?: GraphPushOptions) => void = function(data: In) { }) {
        super();
        this._callback = callback;
    }
    
    public get callback(): (data: In, options?: GraphPushOptions) => void {
        return this._callback;
    }

    public set callback(callback: (data: In, options?: GraphPushOptions) => void) {
        this._callback = callback;
    }

    public onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.callback(data, options);
            resolve();
        });
    }
    
} 
