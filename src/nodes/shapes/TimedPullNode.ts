import { DataFrame } from '../../data/DataFrame';
import { PullOptions } from '../../graph';
import { Node, NodeOptions } from '../../Node';
import { TimeUnit } from '../../utils/unit';

export class TimedPullNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _interval: number;
    private _timer: NodeJS.Timeout;
    private _pushFinished = true;
    protected options: TimedPullOptions;

    constructor(interval: number, intervalUnit = TimeUnit.MILLISECOND, options?: TimedPullOptions) {
        super(options);
        this._interval = intervalUnit.convert(interval, TimeUnit.MILLISECOND);

        this.on('push', this._onPush.bind(this));
        this.once('build', this._start.bind(this));
        this.once('destroy', this._stop.bind(this));
    }

    private _onPush(frame: InOut): Promise<void> {
        return new Promise((resolve, reject) => {
            const pushPromises: Array<Promise<void>> = [];
            this.outputNodes.forEach((node) => {
                pushPromises.push(node.push(frame));
            });

            // Restart the timer
            clearInterval(this._timer);
            this._timer = setInterval(this._intervalFn.bind(this), this._interval);

            this._pushFinished = false;
            Promise.all(pushPromises)
                .then(() => {
                    resolve();
                })
                .catch(reject)
                .finally(() => {
                    this._pushFinished = true;
                });
        });
    }

    private _intervalFn(): void {
        if (this._pushFinished || !this.options.throttlePull) {
            const promises: Array<Promise<void>> = [];
            this.inputNodes.forEach((node) => {
                promises.push(node.pull());
            });
            Promise.resolve(promises);
        }
    }

    /**
     * Start the timed pull
     *
     * @returns {Promise<void>} Start promise
     */
    private _start(): Promise<void> {
        return new Promise((resolve) => {
            this._timer = setInterval(this._intervalFn.bind(this), this._interval);
            resolve();
            this.emit('ready');
        });
    }

    private _stop(): void {
        if (this._timer !== undefined) {
            clearInterval(this._timer);
        }
    }
}

export interface TimedPullOptions extends NodeOptions {
    /**
     * Throttle pull requests if the push request has not resolved yet
     */
    throttlePull?: boolean;
    pullOptions?: PullOptions;
}
