import { DataFrame } from "../data";
import { Layer } from "./Layer";
import { FlowType } from "./FlowType";
import { PushOptions } from "./PushOptions";
import { PullOptions } from "./PullOptions";

export abstract class BufferLayer<T extends DataFrame, K extends DataFrame> extends Layer<T,K>{

    constructor(name: string = "buffer") {
        super(name);
        this.setInputFlowType(FlowType.PUSH);
        this.setOutputFlowType(FlowType.PULL);
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public abstract push(data: T, options: PushOptions) : Promise<void>;

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public abstract pull(options: PullOptions) : Promise<K>;
}
