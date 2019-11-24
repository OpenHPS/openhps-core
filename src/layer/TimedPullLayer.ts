import { DataFrame, TimeUnit } from "../data";
import { Layer } from "./Layer";
import { PushOptions, PullOptions } from "./DataOptions";
import { rejects } from "assert";

export class TimedPullLayer<T extends DataFrame, K extends DataFrame> extends Layer<T, K> {
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
    public start(options: PullOptions = PullOptions.DEFAULT): void {
        const timer: NodeJS.Timeout = setInterval(() => {
            this.getInputLayer().pull(options).then((data: T) => {
                this.push(data);
            }).catch(ex => {
                rejects(ex);
            });
        }, this._interval);
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions = PushOptions.DEFAULT): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            reject();
        });
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions = PullOptions.DEFAULT): Promise<K> {
        return new Promise<K>((resolve, reject) => {
            reject();
        });
    }

}
