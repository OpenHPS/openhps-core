import { DataFrame } from "../../data/DataFrame";
import { PushOptions, DataOptions } from "../DataOptions";
import { ProcessingLayer } from "../processing";
import { Model } from "../../Model";

/**
 * Output layer that saves data objects contained in the pushed
 * data frames. An output layer does not push the data frames
 * to the next layer meaning you should only use this layer.
 */
export class OutputLayer<T extends DataFrame> extends ProcessingLayer<T, T> {

    constructor() {
        super();
        this.setOutputLayer(null);
    }

    /**
     * Push the data to the output
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.process(data, options).then(result => {
                resolve(); // Sink, do not push to next layer
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public process(data: T, options: DataOptions): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            for (const object of data.getObjects()) {
                const service = this.getParent<Model<any, any>>().getDataServiceByObject(object);
                if (object.getUID() !== null) {
                    await service.update(object);
                } else {
                    await service.create(object);
                }
            }
            resolve(data);
            if (this.getOutputLayer() !== null) {
                // Push to next layer without waiting for a response
                this.getOutputLayer().push(data, options);
            }
        });
    }

    public predict(data: T, options: DataOptions): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            resolve(data);
            if (this.getOutputLayer() !== null) {
                // Push to next layer without waiting for a response
                this.getOutputLayer().push(data, options);
            }
        });
    }

}
