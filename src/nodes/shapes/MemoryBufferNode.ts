import { DataFrame } from "../../data/DataFrame";
import { Node } from "../../Node";

export class MemoryBufferNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _dataFrames: InOut[];

    constructor() {
        super();
        this.on('pull', this.onPull.bind(this));
        this.on('push', this.onPush.bind(this));
    }

    public onPull(): void {
        if (this._dataFrames.length !== 0) {
            this.outputNodes.forEach(node => {
                node.push(this._dataFrames.pop());
            });
        }
    } 

    public onPush(frame: InOut): void {
        this._dataFrames.push(frame);
    }

}
