import { DataFrame } from '../../data';
import { Node } from '../../Node';
import { TimeUnit } from '../../utils';

export class FrameChunkNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _count: number;
    private _queue: InOut[] = [];
    private _interval: number;
    private _timer: NodeJS.Timeout;

    constructor(count: number, timeout?: number, timeoutUnit = TimeUnit.MILLISECOND) {
        super();
        this._count = count;

        if (timeout) {
            this._interval = timeoutUnit.convert(timeout, TimeUnit.MILLISECOND);
            this.once('build', this._start.bind(this));
            this.once('destroy', this._stop.bind(this));
        }

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._queue.push(frame);
            if (this._queue.length >= this._count) {
                this._flushQueue().then(resolve).catch(reject);
            } else {
                resolve();
            }
        });
    }

    private _flushQueue(): Promise<void> {
        return new Promise((resolve) => {
            this._queue = [];

            // Restart the timeout
            if (this._timer !== undefined) {
                clearInterval(this._timer);
                this._timer = setInterval(this._timeoutFn.bind(this), this._interval);
            }

            this.outlets.forEach(outlet => outlet.push(this._queue));
            resolve();
        });
    }

    private _timeoutFn(): void {
        if (this._queue.length > 0) {
            Promise.resolve(this._flushQueue());
        }
    }

    /**
     * Start the timeout timer
     *
     * @returns {Promise<void>} Start promise
     */
    private _start(): Promise<void> {
        return new Promise((resolve) => {
            this._timer = setInterval(this._timeoutFn.bind(this), this._interval);
            resolve();
        });
    }

    private _stop(): void {
        if (this._timer !== undefined) {
            clearInterval(this._timer);
            this._timer = undefined;
        }
    }
}
