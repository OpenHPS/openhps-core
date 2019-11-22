import { DataFrame, DataObject } from "./data";
import { DataService, ObjectDataService } from "./service";
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
    private _services: Map<string, DataService<any>> = new Map();

    constructor(name: string = "model") {
        super(name);
        this._addDefaultDataServices();
    }

    private _addDefaultDataServices(): void {
        this.addDataService(new ObjectDataService());
    }

    /**
     * Get data service by data type
     * @param dataType Data type
     */
    public getDataService<D extends DataObject, F extends DataService<D>>(dataType: new () => D): F {
        if (this._services.has(dataType.name)) {
            return this._services.get(dataType.name) as F;
        } else {
            return null;
        }
    }

    /**
     * Get data service by data object
     * @param dataObject Data object instance
     */
    public getDataServiceByObject<D extends DataObject, F extends DataService<D>>(dataObject: D): F {
        if (this._services.has(dataObject.constructor.name)) {
            return this._services.get(dataObject.constructor.name) as F;
        } else {
            return null;
        }
    }

    /**
     * Add data service to model
     * @param service Data service
     */
    public addDataService(service: DataService<any>): void {
        this._services.set(service.getTypeName(), service);
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
