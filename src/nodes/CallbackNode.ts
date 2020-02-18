import { DataFrame } from "../data/DataFrame";
import { GraphPushOptions } from "../graph/GraphPushOptions";
import { Node } from "../Node";

export class CallbackNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _pushCallback: (data: InOut, options?: GraphPushOptions) => void;

    constructor(pushCallback: (data: InOut, options?: GraphPushOptions) => void = function(data: InOut) { }) {
        super();
        this._pushCallback = pushCallback;

        this.on('push', this._onPush.bind(this));
    }
    
    public get pushCallback(): (data: InOut, options?: GraphPushOptions) => void {
        return this._pushCallback;
    }

    public set pushCallback(pushCallback: (data: InOut, options?: GraphPushOptions) => void) {
        this._pushCallback = pushCallback;
    }

    private _onPush(data: InOut, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.pushCallback(data, options);
            resolve();
        });
    }
    
} 
