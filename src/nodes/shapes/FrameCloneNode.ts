import { DataFrame } from '../../data';
import { PushOptions } from '../../graph';
import { Node, NodeOptions } from '../../Node';

export class FrameCloneNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    protected options: FrameCloneOptions;

    constructor(options?: FrameCloneOptions) {
        super(options);
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: InOut, options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const newFrame: InOut = this.options.repack ? this._repack(frame) : frame.clone();
            Promise.all(this.outlets.map((outlet) => outlet.push(newFrame, options)))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    private _repack(frame: InOut): InOut {
        const newFrame = new DataFrame();
        frame.getObjects().forEach((object) => {
            newFrame.addObject(object);
        });
        return newFrame as InOut;
    }
}

export interface FrameCloneOptions extends NodeOptions {
    repack?: boolean;
}
