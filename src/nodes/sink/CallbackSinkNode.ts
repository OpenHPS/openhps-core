import { DataFrame } from "../../data/DataFrame";
import { SinkNode } from "../SinkNode";

export class CallbackSinkNode<In extends DataFrame | DataFrame[]> extends SinkNode<In> {
    private _callback: (frame: In) => void;

    constructor(callback: (frame: In) => void = function(frame: In) { }) {
        super();
        this._callback = callback;
    }
    
    public get callback(): (frame: In) => void {
        return this._callback;
    }

    public set callback(callback: (frame: In) => void) {
        this._callback = callback;
    }

    public onPush(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.callback(frame);
            resolve();
        });
    }
    
} 
