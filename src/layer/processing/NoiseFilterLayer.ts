import { Layer } from "../Layer";
import { DataFrame } from "../../data";
import { PushOptions } from "../PushOptions";
import { PullOptions } from "../PullOptions";

export class NoiseFilterLayer<T extends DataFrame, K extends DataFrame> extends Layer<T, K> {
    
    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions): Promise<void> {
        return null;
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<K> {
        return null;
    }

}
