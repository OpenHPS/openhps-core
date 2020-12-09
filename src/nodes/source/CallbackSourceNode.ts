import { DataFrame } from '../../data/DataFrame';
import { PullOptions } from '../../graph';
import { SourceNode, SourceNodeOptions } from '../SourceNode';

export class CallbackSourceNode<Out extends DataFrame> extends SourceNode<Out> {
    public callback: (options?: PullOptions) => Promise<Out> | Out;

    constructor(callback: (options?: PullOptions) => Promise<Out> | Out = () => null, options?: SourceNodeOptions) {
        super(null, options);
        this.callback = callback;
    }

    public onPull(options?: PullOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            Promise.resolve(this.callback(options))
                .then((output) => {
                    resolve(output);
                })
                .catch(reject);
        });
    }
}
