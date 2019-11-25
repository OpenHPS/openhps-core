import { DataFrame, DataObject } from "./data";
import { DataService, ObjectDataService, Service } from "./service";
import { LayerContainer } from "./layer/Layer";
import { ServiceContainer } from "./service/ServiceContainer";
import * as cluster from 'cluster';
import { Socket } from "net";

/**
 * This model contains an [[InputLayer]], [[OutputLayer]] and one or more [[ProcessingLayer]]'s
 * 
 * ## Usage
 * ```typescript
 * ```
 */
export class Model<T extends DataFrame, K extends DataFrame> extends LayerContainer<T, K> implements ServiceContainer {
    private _services: Map<string, Service> = new Map();
    private _workers: cluster.Worker[] = new Array();

    /**
     * Create a new OpenHPS model
     * @param name Name of the model
     */
    constructor(name: string = "model") {
        super(name);
        this._addDefaultServices();
        if (!this.isMaster()) {
            // Register worker events
            process.on('message', this._onMasterMessage);
        }
    }

    private _addDefaultServices(): void {
        this.addService(new ObjectDataService());
    }

    /**
     * Get service by name
     * @param name Service name
     */
    public getServiceByName<F extends Service>(name: string): F {
        if (this._services.has(name)) {
            return this._services.get(name) as F;
        } else {
            return null;
        }
    }

    /**
     * Get service by name
     * @param name Service name
     */
    public getServiceByClass<F extends Service>(serviceClass: new () => F): F {
        return this.getServiceByName(serviceClass.name);
    }

    /**
     * Get data service by data type
     * @param dataType Data type
     */
    public getDataService<D extends DataObject, F extends DataService<D>>(dataType: new () => D): F {
        return this.getServiceByName(dataType.name);
    }

    /**
     * Get data service by data object
     * @param dataObject Data object instance
     */
    public getDataServiceByObject<D extends DataObject, F extends DataService<D>>(dataObject: D): F {
        return this.getServiceByName(dataObject.constructor.name);
    }

    /**
     * Add service to model
     * @param service Service
     */
    public addService(service: Service): void {
        service.registerServiceContainer(this);
        this._services.set(service.getName(), service);
    }

    /**
     * Remove service from model
     * @param dataType Data type
     */
    public removeService(dataType: new () => any): void {
        if (this._services.has(dataType.name)) {
            this._services.delete(dataType.name);
        }
    }

    /**
     * Get all workers
     */
    public getWorkers(): cluster.Worker[] {
        return this._workers;
    }

    /**
     * Register a new worker to the model
     * @param worker Worker process
     */
    public registerWorker(worker: cluster.Worker): void {
        if (this.isMaster()) {
            worker.on('message', this._onWorkerMessage);
            this._workers.push(worker);
        }
    }

    private _onWorkerMessage(message: any, handle: Socket): void {
        
    }

    private _onMasterMessage(msg: any): void {
        
    }

    /**
     * Is this the master process
     */
    public isMaster(): boolean {
        return cluster.isMaster;
    }

}
