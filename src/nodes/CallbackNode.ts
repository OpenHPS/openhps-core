import { DataFrame } from '../data/DataFrame';
import { GraphOptions, PullOptions, PushOptions } from '../graph';
import { Node, NodeOptions } from '../Node';

export class CallbackNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    public pushCallback: (frame: InOut | InOut[], options?: PushOptions) => Promise<void> | void;
    public pullCallback: (options?: PullOptions) => InOut | InOut[] | Promise<InOut | InOut[]>;

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

    private _onPush(frame: InOut | InOut[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.pushCallback(frame);
            } catch (ex) {
                return reject(ex);
            }

            const pushPromises: Array<Promise<void>> = [];
            this.outlets.forEach((outlet) => {
                pushPromises.push(outlet.push(frame, options));
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
            Promise.resolve(this.pullCallback(options))
                .then((result) => {
                    if (result !== undefined && result !== null) {
                        // Push result
                        Promise.all(this.outlets.map((outlet) => outlet.push(result, options as GraphOptions)))
                            .then(() => {
                                resolve();
                            })
                            .catch(reject);
                    } else {
                        // Forward pull
                        Promise.all(this.inlets.map((inlet) => inlet.pull(options)))
                            .then(() => {
                                resolve();
                            })
                            .catch(reject);
                    }
                })
                .catch(reject);
        });
    }
}
