import { DataFrame } from "../../data/DataFrame";
import { PushOptions, DataOptions } from "../DataOptions";
import { ProcessingLayer } from "../processing";

/**
 * # OpenHPS: Output Layer
 * Output layer for storing data
 */
export class OutputLayer<T extends DataFrame> extends ProcessingLayer<T, T> {

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
        return new Promise<T>((resolve, reject) => {
            data.getObjects().forEach(object => {
                // @ts-ignore
                const service = this.getParent().getDataServiceByObject(object);
                if (object.getId() !== null) {
                    service.update(object).then((_: void) => {
                        resolve();
                    }).catch((ex: any) => {
                        reject(ex);
                    });
                } else {
                    service.create(object).then((_: void) => {
                        resolve();
                    }).catch((ex: any) => {
                        reject(ex);
                    });
                }
            });
        });
    }

}
