import { Layer } from "../Layer";
import { DataFrame } from "../../data/DataFrame";
import { DataOptions, PullOptions, PushOptions } from "../DataOptions";

/**
 * The processing layer provides a layer than can process the results
 * from the previous layer.
 */
export abstract class ProcessingLayer<In extends DataFrame, Out extends DataFrame> extends Layer<In, Out> {

    /**
     * Create a new processing layer
     */
    constructor() {
        super();
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: In, options: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.process(data, options).then(result => {
                return this.getOutputLayer().push(result, options);
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
    public pull(options: PullOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
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
    public abstract process(data: In, options: DataOptions): Promise<Out>;

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public predict(data: In, options: DataOptions): Promise<Out> {
        return this.process(data, options);
    }

}
