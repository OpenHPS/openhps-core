import { BufferLayer } from "./BufferLayer";
import { DataFrame } from "../../data";
import { PullOptions, PushOptions } from "../DataOptions";

/**
 * Memory buffer that stores pushed data frames until a pull
 * on the layer is received.
 */
export class MemoryBufferLayer<T extends DataFrame> extends BufferLayer<T, T> {
    private _dataFrames: T[];

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
            this._dataFrames.push(data);
            resolve();
        });
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._dataFrames.length !== 0) {
                resolve(this._dataFrames.pop());
            } else {
                resolve(null);
            }
        });
    }

}
