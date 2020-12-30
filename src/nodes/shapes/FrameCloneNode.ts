import { DataFrame } from '../../data';
import { PushOptions } from '../../graph';
import { Node, NodeOptions } from '../../Node';

/**
 * @category Flow shape
 */
export class FrameCloneNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    protected options: FrameCloneOptions;

    constructor(options?: FrameCloneOptions) {
        super(options);
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: InOut, options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            const newFrame: InOut = this.options.repack ? this._repack(frame) : frame.clone();
            this.outlets.forEach((outlet) => outlet.push(newFrame, options));
            resolve();
        });
    }

    private _repack(frame: InOut): InOut {
        const newFrame = new DataFrame();
        newFrame.createdTimestamp = frame.createdTimestamp;
        frame.getObjects().forEach((object) => {
            newFrame.addObject(object.clone());
        });
        return newFrame as InOut;
    }
}

export interface FrameCloneOptions extends NodeOptions {
    repack?: boolean;
    /**
     * Remove the frame that is cloned from the data service
     */
    removeFrame?: boolean;
}
