import { DataFrame } from "../data";
import { Layer } from "./Layer";
import { PushOptions, PullOptions } from "./DataOptions";

export class MergeLayer<T extends DataFrame, K extends DataFrame> extends Layer<T, K> {
    
    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getInputLayer().push(data, options).then(_ => {
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
                
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}
