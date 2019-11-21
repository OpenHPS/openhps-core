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
 * ```
 */
export class Model<T extends DataFrame, K extends DataFrame> extends LayerContainer<T, K> {
    private _services: Map<string, DataService<any>>;

    constructor(name: string = "model") {
        super(name);
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
