import { BufferLayer } from "./BufferLayer";
import { DataFrame } from "../../data";
import { PullOptions, PushOptions } from "../";

export class MemoryBufferLayer<T extends DataFrame, K extends DataFrame> extends BufferLayer<T, K> {
    private _dataFrames: DataFrame[];

    constructor(name: string = "memorybuffer") {
        super(name);
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {

        });
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<K> {
        return new Promise<K>((resolve, reject) => {

        });
    }

}
