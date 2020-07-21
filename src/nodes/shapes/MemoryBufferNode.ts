import { DataFrame } from "../../data/DataFrame";
import { Node } from "../../Node";

export class MemoryBufferNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _dataFrames: InOut[] = new Array();

    constructor(maxSize?: number) {
        super();

        this.on('pull', this.onPull.bind(this));
        this.on('push', this.onPush.bind(this));
    }

    public onPull(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._dataFrames.length !== 0) {
                const frame = this._dataFrames.pop();
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(frame));
                });
                Promise.all(pushPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                resolve();
            }
        });
    } 

    public onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._dataFrames.push(frame);
            resolve();
        });
    }

}
