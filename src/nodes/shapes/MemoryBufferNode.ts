import { DataFrame } from '../../data/DataFrame';
import { GraphOptions, PullOptions } from '../../graph';
import { Node, NodeOptions } from '../../Node';

export class MemoryBufferNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    protected _dataFrames: InOut[];

    constructor(options?: MemoryBufferOptions) {
        super(options);
        this._dataFrames = [];

        this.on('pull', this.onPull.bind(this));
        this.on('push', this.onPush.bind(this));
    }

    public onPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this._dataFrames.length !== 0) {
                const frame = this._dataFrames.shift();
                this.outlets.forEach((outlet) => outlet.push(frame, options as GraphOptions));
                resolve();
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
