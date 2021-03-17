import { DataFrame } from '../../data';
import { PushOptions } from '../../graph/options';
import { Node, NodeOptions } from '../../Node';

/**
 * @category Flow shape
 */
export class FrameFlattenNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    constructor(options?: NodeOptions) {
        super(options);
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frames: InOut[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            frames.map((frame) => this.outlets.forEach((outlet) => outlet.push(frame, options)));
            resolve();
        });
    }
}
