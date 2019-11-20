import { DataFrame } from "./data";
import { PushOptions } from "./layer/PushOptions";
import { PullOptions } from "./layer/PullOptions";
import { DataService } from "./service";
import { LayerContainer } from "./layer";

/**
 * # OpenHPS: Model
 * This model contains an [[InputLayer]], [[OutputLayer]] and one or more [[ProcessingLayer]]'s
 * 
 * ## Usage
 * ```typescript
 * let model = new Model<...,...>();
 * model.addLayer(...);
 * model.process(...).then(result => {
 *  ...
 * });
 * ```
 */
export class Model<T extends DataFrame, K extends DataFrame> extends LayerContainer<T, K> {
    private _services: Map<string, DataService<any>>;

    constructor(name: string = "model") {
        super(name);
    }

    /**
     * Push the data to the model
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions = PushOptions.DEFAULT): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Push the data to the first layer in the model
            const firstLayer = this.getLayers()[0];
            if (firstLayer === null) {
                throw new Error(`No layers added to the model '${this.getName()}'!`);
            }
            firstLayer.push(data, options).then(result => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Pull the data from the last layer in the model
     * @param options Pull options
     */
    public pull(options: PullOptions = PullOptions.DEFAULT): Promise<K> {
        return new Promise<K>((resolve, reject) => {
            // Pull the data from the last layer in the model
            const lastLayer = this.getLayers()[this.getLayers().length - 1];
            if (lastLayer === null) {
                throw new Error(`No layers added to the model '${this.getName()}'!`);
            }
            lastLayer.pull(options).then(result => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Get data service by data type
     * @param dataType Data type
     */
    public getDataService<D>(dataType: new () => D): DataService<D> {
        if (this._services.has(dataType.name)) {
            return this._services.get(dataType.name);
        } else {
            return null;
        }
    }

    /**
     * Add data service to model
     * @param service Data service
     */
    public addDataService(service: DataService<any>): void {
        this._services.set(null, service);
    }

    /**
     * Remove data service from model
     * @param dataType Data type
     */
    public removeDataService(dataType: new () => any): void {
        if (this._services.has(dataType.name)) {
            this._services.delete(dataType.name);
        }
    }

}
