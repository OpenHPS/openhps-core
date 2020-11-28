import { DataFrame } from '../../data/DataFrame';
import { Node, NodeOptions } from '../../Node';

export class MemoryBufferNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    protected _dataFrames: InOut[];

    constructor(options?: MemoryBufferOptions) {
        super(options);
        this._dataFrames = [];

        this.on('pull', this.onPull.bind(this));
        this.on('push', this.onPush.bind(this));
    }

    public onPull(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._dataFrames.length !== 0) {
                const frame = this._dataFrames.shift();
                const pushPromises: Array<Promise<void>> = [];
                this.outputNodes.forEach((node) => {
                    pushPromises.push(node.push(frame));
                });
                Promise.all(pushPromises)
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }

    public onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve) => {
            this._dataFrames.push(frame);
            resolve();
        });
    }
}

export type MemoryBufferOptions = NodeOptions;
