import { DataFrame } from '../../data';
import { PushOptions } from '../../graph';
import { Node } from '../../Node';

export class FrameCloneNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    constructor() {
        super();
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: InOut, options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const pushPromises: Array<Promise<void>> = [];
            this.outlets.forEach((outlet) => {
                pushPromises.push(outlet.push(frame.clone(), options));
            });

            Promise.all(pushPromises)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }
}
