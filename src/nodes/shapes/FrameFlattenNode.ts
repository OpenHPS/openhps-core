import { DataFrame } from '../../data';
import { PushOptions } from '../../graph';
import { Node, NodeOptions } from '../../Node';

export class FrameFlattenNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    constructor(options?: NodeOptions) {
        super(options);
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frames: InOut[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all(frames.map((frame) => this.outlets.map((outlet) => outlet.push(frame, options))))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }
}
