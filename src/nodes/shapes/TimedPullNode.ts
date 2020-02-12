import { DataFrame } from "../../data/DataFrame";
import { Node } from "../../Node";
import { GraphPullOptions } from "../../graph/GraphPullOptions";
import { TimeUnit } from "../../utils/unit";

export class TimedPullNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _interval: number;
    private _intervalUnit: TimeUnit;
    private _timer: NodeJS.Timeout;

    constructor(interval: number, intervalUnit: TimeUnit = TimeUnit.MILLI) {
        super();
        this._interval = interval;
        this._intervalUnit = intervalUnit;

        this.on('build', this._start.bind(this));
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
        });
    }

}
