import { DataFrame, DataObject } from "./data";
import { DataService, ObjectDataService, Service } from "./service";
import { LayerContainer, Layer } from "./layer/Layer";
import { ServiceContainer } from "./service/ServiceContainer";
import { PushOptions, PullOptions } from "./layer/DataOptions";

/**
 * This model contains multiple [[Layer]]s, [[Service]]s to compute
 * [[DataFrame]]s that are pushed or pulled from this model.
 * 
 * ## Usage
 * Please refer to [[ModelFactory]] for creating a new model
 */
export interface Model<In extends DataFrame, Out extends DataFrame> extends ServiceContainer, LayerContainer<In, Out> {

    /**
     * Push the data to the model
     * @param data Input data
     * @param options Push options
     */
    push(data: In, options?: PushOptions): Promise<void>;

    /**
     * Pull the data from the last layer in the model
     * @param options Pull options
     */
    pull(options?: PullOptions): Promise<Out>;

    /**
     * Get service by name
     * @param name Service name
     */
    getServiceByName<F extends Service>(name: string): F;

    /**
     * Get service by name
     * @param name Service name
     */
    getServiceByClass<F extends Service>(serviceClass: new () => F): F;

    /**
     * Get data service by data type
     * @param dataType Data type
     */
    getDataService<D extends DataObject, F extends DataService<D>>(dataType: new () => D): F;

    /**
     * Get data service by data object
     * @param dataObject Data object instance
     */
    getDataServiceByObject<D extends DataObject, F extends DataService<D>>(dataObject: D): F;

}

/**
 * [[Model]] implementation
 */
class ModelImpl<In extends DataFrame, Out extends DataFrame> extends LayerContainer<In, Out> implements Model<In, Out> {
    private _services: Map<string, Service> = new Map();

    /**
     * Create a new OpenHPS model
     * @param name Name of the model
     */
    constructor(name: string = "model") {
        super(name);
        this._addDefaultServices();
    }

    private _addDefaultServices(): void {
        this.addService(new ObjectDataService());
    }

    public push(data: In, options: PushOptions = PushOptions.DEFAULT): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            super.push(data, options).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public pull(options: PullOptions = PullOptions.DEFAULT): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            super.pull(options).then(result => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public getServiceByName<F extends Service>(name: string): F {
        if (this._services.has(name)) {
            return this._services.get(name) as F;
        } else {
            return null;
        }
    }

    public getServiceByClass<F extends Service>(serviceClass: new () => F): F {
        return this.getServiceByName(serviceClass.name);
    }

    public getDataService<D extends DataObject, F extends DataService<D>>(dataType: new () => D): F {
        return this.getServiceByName(dataType.name);
    }

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

    public addLayer(layer: Layer<any, any>): ModelImpl<In, Out> {
        return super.addLayer(layer) as ModelImpl<In, Out>;
    }

    /**
     * Set logger
     */
    public setLogger(logger: (level: string, log: any) => void): void {
        super.setLogger(logger);
    }

}

/**
 * Model build to construct and build a [[Model]]
 * 
 * ## Usage
 * ```typescript
 * const model = new ModelBuilder()
 *      .withName("My Model")
 *      .withLogger((level: string, log:any) => { console.log(log); })
 *      .withLayer(...)
 *      .withLayer(...)
 *      .withService(...)
 *      .build();
 * ```
 */
export class ModelBuilder<In extends DataFrame, Out extends DataFrame> {
    private _model: ModelImpl<In, Out>;

    constructor() {
        this._model = new ModelImpl<In, Out>();
    }

    public withLogger(logger: (level: string, log: any) => void): ModelBuilder<In, Out> {
        this._model.setLogger(logger);
        return this;
    }

    public withService(service: Service): ModelBuilder<In, Out> {
        this._model.addService(service);
        return this;
    }

    /**
     * Set the name of the model
     * @param name Name of the model 
     */
    public withName(name: string): ModelBuilder<In, Out> {
        this._model.setName(name);
        return this;
    }

    /**
     * Add a new layer to the model
     * @param layer Layer to add
     */
    public withLayer(layer: Layer<any, any>): ModelBuilder<In, Out> {
        this._model.addLayer(layer);
        return this;
    }

    /**
     * Finalize the model
     */
    public build(): Model<In, Out> {
        return this._model;
    }
}
