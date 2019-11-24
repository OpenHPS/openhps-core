import { Layer } from "../Layer";
import { DataFrame } from "../../data/DataFrame";
import { PullOptions, PushOptions } from "../DataOptions";

/**
 * Source layer that provides the data frames for the model.
 */
export abstract class SourceLayer<T extends DataFrame> extends Layer<T, T> {

    constructor() {
        super();
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions = PushOptions.DEFAULT): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getInputLayer().push(data, options).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Pull the data from the input 
     * @param options Pull options
     */
    public abstract pull(options: PullOptions): Promise<T>;

}
