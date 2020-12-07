import { DataFrame } from '../data/DataFrame';
import { GraphOptions, PullOptions, PushOptions } from '../graph';
import { Node, NodeOptions } from '../Node';

export class CallbackNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _pushCallback: (frame: InOut | InOut[]) => void;
    private _pullCallback: () => InOut | InOut[];

    constructor(
        pushCallback: (frame: InOut | InOut[]) => void = () => true,
        pullCallback: () => InOut | InOut[] = () => null,
        options?: NodeOptions,
    ) {
        super(options);
        this.pushCallback = pushCallback;
        this.pullCallback = pullCallback;

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
    }

    public get pullCallback(): () => InOut | InOut[] {
        return this._pullCallback;
    }

    public set pullCallback(pullCallback: () => InOut | InOut[]) {
        this._pullCallback = pullCallback;
    }

    public get pushCallback(): (frame: InOut | InOut[]) => void {
        return this._pushCallback;
    }

    public set pushCallback(pushCallback: (frame: InOut | InOut[]) => void) {
        this._pushCallback = pushCallback;
    }

    private _onPush(frame: InOut | InOut[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.pushCallback(frame);
            } catch (ex) {
                return reject(ex);
            }

            const pushPromises: Array<Promise<void>> = [];
            this.outputNodes.forEach((node) => {
                pushPromises.push(node.push(frame, options));
            });

            Promise.all(pushPromises)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    private _onPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let result: InOut | InOut[] = null;
            try {
                result = this.pullCallback();
            } catch (ex) {
                return reject(ex);
            }

            if (result !== undefined && result !== null) {
                const pushPromises: Array<Promise<void>> = [];
                this.outputNodes.forEach((node) => {
                    pushPromises.push(node.push(result, options as GraphOptions));
                });

                Promise.all(pushPromises)
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            } else {
                const pullPromises: Array<Promise<void>> = [];
                this.inputNodes.forEach((node) => {
                    pullPromises.push(node.pull(options));
                });

                Promise.all(pullPromises)
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }
}
