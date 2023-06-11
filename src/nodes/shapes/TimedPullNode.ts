import { DataFrame } from '../../data/DataFrame';
import { PullOptions, PushOptions } from '../../graph/options';
import { Node, NodeOptions } from '../../Node';
import { TimeUnit } from '../../utils/unit';

/**
 * @category Flow shape
 */
export class TimedPullNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _interval: number;
    private _timer: NodeJS.Timeout;
    private _pushFinished = true;
    private _pullFinished = true;
    protected options: TimedPullOptions;

    constructor(interval: number, intervalUnit = TimeUnit.MILLISECOND, options?: TimedPullOptions) {
        super(options);
        this._interval = intervalUnit.convert(interval, TimeUnit.MILLISECOND);
        this.options.autoStart = this.options.autoStart || true;

        this.on('push', this._onPush.bind(this));
        if (this.options.autoStart) {
            this.once('build', this.start.bind(this));
        }
        this.once('destroy', this.stop.bind(this));
    }

    private _onPush(frame: InOut, options?: PushOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const pushPromises: Array<Promise<void>> = [];
            pushPromises.push(...this.outlets.map((outlet) => outlet.push(frame, options)));

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
        if ((this._pushFinished && this._pullFinished) || !this.options.throttlePull) {
            this._pullFinished = true;
            Promise.all(this.inlets.map((inlet) => inlet.pull(this.options.pullOptions)))
                .then(() => {
                    this._pullFinished = true;
                })
                .catch((ex) => {
                    this.logger('error', ex.message, ex);
                });
        }
    }

    /**
     * Start the timed pull
     *
     * @returns {Promise<void>} Start promise
     */
    public start(): Promise<void> {
        return new Promise((resolve) => {
            if (this._timer) {
                this.stop();
            }
            this._timer = setInterval(this._intervalFn.bind(this), this._interval);
            resolve();
        });
    }

    public stop(): void {
        if (this._timer !== undefined) {
            clearInterval(this._timer);
            this._timer = undefined;
        }
    }
}

export interface TimedPullOptions extends NodeOptions {
    /**
     * Throttle pull requests if the push request has not resolved yet
     */
    throttlePull?: boolean;
    pullOptions?: PullOptions;
    /**
     * Auto start timed pull
     *
     * @default true
     */
    autoStart?: boolean;
}
