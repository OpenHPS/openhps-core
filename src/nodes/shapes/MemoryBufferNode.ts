import { DataFrame } from "../../data/DataFrame";
import { Node } from "../../Node";
import { GraphPushOptions } from "../../graph/GraphPushOptions";
import { GraphPullOptions } from "../../graph/GraphPullOptions";

export class MemoryBufferNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _dataFrames: InOut[];

    constructor() {
        super();
        this.on('pull', this.onPull.bind(this));
        this.on('push', this.onPush.bind(this));
    }

    public onPull(options?: GraphPullOptions): void {
        if (this._dataFrames.length !== 0) {
            this.getOutputNodes().forEach(node => {
                node.push(this._dataFrames.pop(), options);
            });
        }
    } 

    public onPush(data: InOut, options?: GraphPushOptions): void {
        this._dataFrames.push(data);
    }

}
