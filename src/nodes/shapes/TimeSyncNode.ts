import { DataFrame } from '../../data/DataFrame';
import { Node, NodeOptions } from '../../Node';

/**
 * Time synchronization node.
 *
 * @category Flow shape
 */
export class TimeSyncNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    constructor(options?: NodeOptions) {
        super(options);
        this.on('push', this.onPush.bind(this));
    }

    public onPush(frame: InOut): Promise<void> {
        return;
    }
}

export type TimeSyncOptions = NodeOptions;
