import { DataFrame } from "../../data/DataFrame";
import { Node } from "../../Node";
import { TimeUnit } from "../../utils/unit";
import { GraphPushOptions } from "../../graph";

export class TimedPullNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _interval: number;
    private _intervalUnit: TimeUnit;
    private _timer: NodeJS.Timeout;

    constructor(interval: number, intervalUnit: TimeUnit = TimeUnit.MILLI) {
        super();
        this._interval = interval;
        this._intervalUnit = intervalUnit;

        this.on('push', this._onPush.bind(this));
        this.once('build', this._start.bind(this));
        this.once('destroy', this._stop.bind(this));
    }

    private _onPush(data: InOut, options?: GraphPushOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const pushPromises = new Array();
            this.outputNodes.forEach(node => {
                pushPromises.push(node.push(data, options));
            });

            Promise.all(pushPromises).then(_ => {
                this._timer.refresh();
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Start the timed pull
     */
    private _start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._timer = setInterval(() => {
                const promises = new Array();
                this.inputNodes.forEach(node => {
                    promises.push(node.pull());
                });
                Promise.resolve(promises);
            }, this._intervalUnit.convert(this._interval, TimeUnit.MILLI));
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
