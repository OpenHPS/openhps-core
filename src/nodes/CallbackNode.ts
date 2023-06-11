import { DataFrame } from '../data/DataFrame';
import { GraphOptions, PullOptions, PushOptions } from '../graph/options';
import { Node, NodeOptions } from '../Node';

/**
 * @category Node
 */
export class CallbackNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    pushCallback: (frame: InOut | InOut[], options?: PushOptions) => Promise<void> | void;
    pullCallback: (options?: PullOptions) => InOut | InOut[] | Promise<InOut | InOut[]>;
    protected options: CallbackNodeOptions;

    constructor(
        pushCallback: (frame: InOut | InOut[]) => void = () => true,
        pullCallback: () => InOut | InOut[] = () => null,
        options?: CallbackNodeOptions,
    ) {
        super(options);
        this.pushCallback = pushCallback;
        this.pullCallback = pullCallback;

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));

        this.options.autoPush = this.options.autoPush || true;
    }

    private _onPush(frame: InOut | InOut[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.resolve(this.pushCallback(frame, options))
                .then(() => {
                    if (this.options.autoPush) {
                        return Promise.all(this.outlets.map((outlet) => outlet.push(frame, options as GraphOptions)));
                    } else {
                        resolve();
                    }
                })
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

export interface CallbackNodeOptions extends NodeOptions {
    /**
     * Automatically push data frames. If set to false it is expected that the
     * callback handles the pushing.
     *
     * @default true
     */
    autoPush?: boolean;
}
