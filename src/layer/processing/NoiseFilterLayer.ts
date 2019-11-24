import { DataFrame } from "../../data";
import { DataOptions } from "../DataOptions";
import { ProcessingLayer } from "./ProcessingLayer";

export class NoiseFilterLayer<T extends DataFrame, K extends DataFrame> extends ProcessingLayer<T, K> {
    
    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public process(data: T, options: DataOptions): Promise<K> {
        return null;
    }

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public predict(data: T, options: DataOptions): Promise<K> {
        return null;
    }

}
