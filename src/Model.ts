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
     * Get service by name
     * @param name Service name
     */
    findServiceByName<F extends Service>(name: string): F;

    /**
     * Get service by name
     * @param name Service name
     */
    findServiceByClass<F extends Service>(serviceClass: new () => F): F;

    findDataServiceByName<F extends DataService<any>>(name: string): F;
    
    /**
     * Get data service by data type
     * @param dataType Data type
     */
    findDataService<D extends DataObject, F extends DataService<D>>(dataType: new () => D): F;

    /**
     * Get data service by data object
     * @param dataObject Data object instance
     */
    findDataServiceByObject<D extends DataObject, F extends DataService<D>>(dataObject: D): F;

}
