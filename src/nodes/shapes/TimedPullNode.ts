import { DataFrame } from "../../data/DataFrame";
import { Node } from "../../Node";
import { TimeUnit } from "../../utils/unit";

export class TimedPullNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _interval: number;
    private _timer: NodeJS.Timeout;

    constructor(interval: number, intervalUnit: TimeUnit = TimeUnit.MILLISECOND) {
        super();
        this._interval = intervalUnit.convert(interval, TimeUnit.MILLISECOND);

        this.on('push', this._onPush.bind(this));
        this.once('build', this._start.bind(this));
        this.once('destroy', this._stop.bind(this));
    }

    private _onPush(frame: InOut): Promise<void> {
        return new Promise((resolve, reject) => {
            const pushPromises = new Array();
            this.outputNodes.forEach(node => {
                pushPromises.push(node.push(frame));
            });

            // Restart the timer
            clearInterval(this._timer);
            this._timer = setInterval(this._intervalFn.bind(this), this._interval);

            Promise.all(pushPromises).then(() => {
                resolve();
            }).catch(reject);
        });
    }

    private _intervalFn(): void {
        const promises = new Array();
        this.inputNodes.forEach(node => {
            promises.push(node.pull());
        });
        Promise.resolve(promises);
    }

    /**
     * Start the timed pull
     */
    private _start(): Promise<void> {
        return new Promise((resolve, reject) => {
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
