import { DataFrame } from '../../data';
import { Node, NodeOptions } from '../../Node';

export class FrameFlattenNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    constructor(options?: NodeOptions) {
        super(options);
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frames: InOut[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const pushPromises: Array<Promise<void>> = [];
            frames.forEach((frame) => {
                this.outlets.forEach((outlet) => {
                    pushPromises.push(outlet.push(frame));
                });
            });

            Promise.all(pushPromises)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }
}
