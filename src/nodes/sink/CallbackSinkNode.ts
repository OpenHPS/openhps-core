import { DataFrame } from '../../data/DataFrame';
import { PushOptions } from '../../graph';
import { SinkNode, SinkNodeOptions } from '../SinkNode';

export class CallbackSinkNode<In extends DataFrame> extends SinkNode<In> {
    public callback: (frame: In | In[], options?: PushOptions) => Promise<void> | void;

    constructor(
        callback: (frame: In | In[], options?: PushOptions) => Promise<void> | void = () => null,
        options?: SinkNodeOptions,
    ) {
        super(options);
        this.callback = callback;
    }

    public onPush(frame: In, options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.resolve(this.callback(frame, options)).then(resolve).catch(reject);
        });
    }
}
