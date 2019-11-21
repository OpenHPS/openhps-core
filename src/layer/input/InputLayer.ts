import { Layer } from "../Layer";
import { DataFrame } from "../../data/DataFrame";
import { PullOptions, PushOptions } from "../";

/**
 * # OpenHPS: Input Layer
 * Input layer for predicing and processing data
 */
export abstract class InputLayer<T extends DataFrame> extends Layer<T, T> {

    constructor(name: string = "input") {
        super(name);
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions = PushOptions.DEFAULT): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getNextLayer().push(data, options).then(_ => {
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
