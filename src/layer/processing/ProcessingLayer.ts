import { Layer } from "../Layer";
import { DataFrame } from "../../data/DataFrame";
import { DataOptions, PullOptions, PushOptions } from "../DataOptions";

/**
 * The processing layer provides a layer than can sequentially process the results
 * from the previous layer.
 */
export abstract class ProcessingLayer<T extends DataFrame, K extends DataFrame> extends Layer<T, K> {

    constructor() {
        super();
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.process(data, options).then(result => {
                return this.getInputLayer().push(result, options);
            }).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<K> {
        return new Promise<K>((resolve, reject) => {
            this.getInputLayer().pull(options).then(data => {
                if (options.process) {
                    return this.process(data, options);
                } else {
                    return this.predict(data, options);
                }
            }).then(result => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public abstract process(data: T, options: DataOptions): Promise<K>;

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public abstract predict(data: T, options: DataOptions): Promise<K>;

}
