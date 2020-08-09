import { DataFrame } from "../../data/DataFrame";
import { SinkNode } from "../SinkNode";

export class CallbackSinkNode<In extends DataFrame | DataFrame[]> extends SinkNode<In> {
    private _callback: (frame: In) => Promise<void> | void;

    constructor(callback: (frame: In) => Promise<void> | void = () => null) {
        super();
        this._callback = callback;
    }
    
    public get callback(): (frame: In) => Promise<void> | void {
        return this._callback;
    }

    public set callback(callback: (frame: In) => Promise<void> | void) {
        this._callback = callback;
    }

    public onPush(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.resolve(this.callback(frame)).then(output => {
                resolve(output);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
    
} 
