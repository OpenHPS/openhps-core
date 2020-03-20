import { DataFrame, DataObject } from "./data";
import { DataService, Service } from "./service";
import { GraphImpl } from "./graph/_internal/implementations/GraphImpl";
import { GraphPushOptions } from "./graph/GraphPushOptions";
import { GraphPullOptions } from "./graph/GraphPullOptions";

/**
 * This model contains multiple [[Node]]s, [[Service]]s to compute
 * [[DataFrame]]s that are pushed or pulled from this model.
 * 
 * ## Usage
 * Please refer to [[ModelBuilder]] for creating a new model
 */
export interface Model<In extends DataFrame, Out extends DataFrame> extends GraphImpl<In, Out> {

    /**
     * Push data to the model
     * 
     * @param data Input data
     * @param options Push options
     */
    push(data: In, options?: GraphPushOptions): Promise<void>;

    /**
     * Pull data from the model
     * 
     * @param options Pull options
     */
    pull(options?: GraphPullOptions): Promise<void>;

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
    findDataService<D extends DataObject, F extends DataService<any, D>>(dataType: new () => D): F;

    /**
     * Find data service by data object
     * @param dataObject Data object instance
     */
    findDataServiceByObject<D extends DataObject, F extends DataService<any, D>>(dataObject: D): F;

}
