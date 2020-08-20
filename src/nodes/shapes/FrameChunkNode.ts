import { DataFrame } from "../../data";
import { Node } from "../../Node";
import { TimeUnit } from "../../utils";

export class FrameChunkNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _count: number;
    private _queue: InOut[] = [];

    constructor(count: number, timeout?: number, timeoutUnit?: TimeUnit) {
        super();
        this._count = count;

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._queue.push(frame);
            if (this._queue.length >= this._count) {
                const pushPromises: Array<Promise<void>> = [];
                this.outputNodes.forEach(outputNode => {
                    pushPromises.push(outputNode.push(this._queue));
                });
                this._queue = [];
                Promise.all(pushPromises).then(() => {
                    resolve();
                }).catch(reject);
            } else {
                resolve();
            }
        });
    }
}
