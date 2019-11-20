import { Layer } from "../Layer";
import { DataFrame } from "../../data/DataFrame";
import { PushOptions } from "../PushOptions";
import { PullOptions } from "../PullOptions";

/**
 * # OpenHPS: Processing Layer
 * The processing layer provides a layer than can sequentially process the results
 * from the previous layer.
 */
export abstract class ProcessingLayer<T extends DataFrame, K extends DataFrame> extends Layer<T, K> {

    constructor(name: string = "processor") {
        super(name);
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public abstract push(data: T, options: PushOptions): Promise<void>;

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public abstract pull(options: PullOptions): Promise<K>;

}
