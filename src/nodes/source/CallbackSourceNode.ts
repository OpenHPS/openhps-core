import { DataFrame } from '../../data/DataFrame';
import { SourceNode, SourceNodeOptions } from '../SourceNode';

export class CallbackSourceNode<Out extends DataFrame> extends SourceNode<Out> {
    private _callback: () => Promise<Out> | Out;

    constructor(callback: () => Promise<Out> | Out = () => null, options?: SourceNodeOptions) {
        super(null, options);
        this.callback = callback;
    }

    public get callback(): () => Promise<Out> | Out {
        return this._callback;
    }

    public set callback(callback: () => Promise<Out> | Out) {
        this._callback = callback;
    }

    public onPull(): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            Promise.resolve(this.callback())
                .then((output) => {
                    resolve(output);
                })
                .catch((ex) => {
                    reject(ex);
                });
        });
    }
}
