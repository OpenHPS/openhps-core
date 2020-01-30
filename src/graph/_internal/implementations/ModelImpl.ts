import { DataFrame, DataObject } from "../../../data";
import { Service, DataObjectService, DataService } from "../../../service";
import { GraphImpl } from "./GraphImpl";
import { Model } from "../../../Model";
import { DataFrameService } from "../../../service/DataFrameService";
import { GraphPushOptions } from "../../GraphPushOptions";

/**
 * [[Model]] implementation
 */
export class ModelImpl<In extends DataFrame, Out extends DataFrame> extends GraphImpl<In, Out> implements Model<In, Out> {
    private _services: Map<string, Service> = new Map();
    private _dataServices: Map<string, DataService<any>> = new Map();

    /**
     * Create a new OpenHPS model
     */
    constructor(name: string = "model") {
        super();
        this.name = name;
        this._addDefaultServices();
    }

    private _addDefaultServices(): void {
        this.addService(new DataObjectService<DataObject>());
        this.addService(new DataFrameService<DataFrame>());
    }

    public findServiceByName<F extends Service>(name: string): F {
        if (this._services.has(name)) {
            return this._services.get(name) as F;
        } else {
            return null;
        }
    }

    public findDataServiceByName<F extends DataService<any>>(name: string): F {
        if (this._dataServices.has(name)) {
            return this._dataServices.get(name) as F;
        } else {
            return null;
        }
    }

    public findServiceByClass<F extends Service>(serviceClass: new () => F): F {
        return this.findServiceByName(serviceClass.name);
    }

    /**
     * Get data service by data type
     * @param dataType Data type
     */
    public findDataService<D extends DataObject, F extends DataService<D>>(dataType: new () => D): F {
        return this.findDataServiceByName(dataType.name);
    }

    /**
     * Get data service by data object
     * @param dataObject Data object instance
     */
    public findDataServiceByObject<D extends DataObject, F extends DataService<D>>(dataObject: D): F {
        return this.findDataServiceByName(dataObject.constructor.name);
    }

    /**
     * Add service to model
     * @param service Service
     */
    public addService(service: Service): void {
        if (service instanceof DataService) {
            // Data service
            this._dataServices.set(service.getName(), service);
        } else {
            // Normal service
            this._services.set(service.getName(), service);
        }
    }

    public push(frame: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Merge the changes in the frame service
            let frameService = this.findDataServiceByName(frame.constructor.name);
            if (frameService === null || frameService === undefined) { 
                frameService = this.findDataServiceByName("DataFrame"); 
            }
            const servicePromises = new Array();
            if (frameService !== null && frameService !== undefined) { 
                // Update the frame
                servicePromises.push(frameService.update(frame));
            }

            Promise.all(servicePromises).then(_1 => {
                this.internalInput.push(frame, options).then(_2 => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}
