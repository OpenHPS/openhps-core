import { DataFrame } from "../../data/DataFrame";
import { Node } from "../../Node";
import { GraphPullOptions } from "../../graph/GraphPullOptions";
import { TimeUnit } from "../../utils/unit";

export class TimedPullNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _interval: number;
    private _intervalUnit: TimeUnit;

    constructor(interval: number, intervalUnit: TimeUnit = TimeUnit.MICRO) {
        super();
        this._interval = interval;
        this._intervalUnit = intervalUnit;
    }

    /**
     * Start the timed pull
     * @param options Pull options
     */
    public start(options?: GraphPullOptions): TimedPullNode<InOut> {
        const timer: NodeJS.Timeout = setInterval(() => {
            const promises = new Array();
            this.inputNodes.forEach(node => {
                promises.push(node.pull(options));
            });
            Promise.resolve(promises);
        }, this._intervalUnit.convert(this._interval, TimeUnit.MICRO));
        return this;
    }

}
