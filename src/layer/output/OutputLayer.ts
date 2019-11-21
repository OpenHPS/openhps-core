import { Layer } from "../Layer";
import { DataFrame } from "../../data/DataFrame";
import { PullOptions, PushOptions } from "../DataOptions";

/**
 * # OpenHPS: Output Layer
 * Output layer for storing data
 */
export class OutputLayer<T extends DataFrame> extends Layer<T, T> {

    constructor(name: string = "output") {
        super(name);
    }

    /**
     * Push the data to the output
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Store the objects contained in the output to the managers
            data.getObjects().forEach(object => {
                
            });

            resolve();
        });
    }

    /**
     * Pull the data from the previous layer and output it
     * @param options Pull options
     */
    public pull(options: PullOptions = PullOptions.DEFAULT): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.getPreviousLayer().pull(options).then(data => {
                resolve(data);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}
