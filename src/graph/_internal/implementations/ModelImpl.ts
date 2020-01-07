import { DataFrame, DataObject } from "../../../data";
import { Service, ObjectDataService, DataService } from "../../../service";
import { GraphImpl } from "./GraphImpl";
import { Model } from "../../../Model";

/**
 * [[Model]] implementation
 */
export class ModelImpl<In extends DataFrame, Out extends DataFrame> extends GraphImpl<In, Out> implements Model<In, Out> {
    private _services: Map<string, Service> = new Map();

    /**
     * Create a new OpenHPS model
     */
    constructor(name: string = "model") {
        super();
        this.setName(name);
        this._addDefaultServices();
    }

    private _addDefaultServices(): void {
        this.addService(new ObjectDataService());
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

    /**
     * Set logger
     */
    public setLogger(logger: (level: string, log: any) => void): void {
        super.setLogger(logger);
    }

}
