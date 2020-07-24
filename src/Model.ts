import { DataFrame, DataObject, ReferenceSpace } from "./data";
import { DataService, Service } from "./service";
import { GraphImpl } from "./graph/_internal/implementations/GraphImpl";

/**
 * This model contains multiple [[Node]]s, [[Service]]s to compute
 * [[DataFrame]]s that are pushed or pulled from this model.
 * 
 * ## Usage
 * Please refer to [[ModelBuilder]] for creating a new model
 */
export interface Model<In extends DataFrame | DataFrame[] = DataFrame, Out extends DataFrame | DataFrame[] = DataFrame> extends GraphImpl<In, Out> {

    /**
     * Push data to the model
     * 
     * @param frame Input frame
     */
    push(frame: In): Promise<void>;

    /**
     * Pull data from the model
     */
    pull(): Promise<void>;

    /**
     * Find service by name
     * @param name Service name
     */
    findServiceByName<F extends Service>(name: string): F;

    /**
     * Find service by name
     * @param name Service name
     */
    findServiceByClass<F extends Service>(serviceClass: new () => F): F;

    /**
     * Find data service by name
     * @param name Name of the data service
     */
    findDataServiceByName<F extends DataService<any, any>>(name: string): F;
    
    /**
     * Find data service by data type
     * @param dataType Data type
     */
    findDataService<D extends DataObject | DataFrame | Object, F extends DataService<any, D>>(dataType: new () => D): F;

    /**
     * Find data service by data object
     * @param dataObject Data object instance
     */
    findDataServiceByObject<D extends DataObject, F extends DataService<any, D>>(dataObject: D): F;

    /**
     * Find all services
     */
    findAllServices(): Service[];

    /**
     * Model reference space
     */
    referenceSpace: ReferenceSpace;
}
