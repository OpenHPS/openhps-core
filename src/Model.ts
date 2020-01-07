import { DataFrame, DataObject } from "./data";
import { DataService, Service } from "./service";
import { ServiceContainer } from "./service/ServiceContainer";
import { GraphImpl } from "./graph/_internal/implementations/GraphImpl";
import { GraphPullOptions, GraphPushOptions } from "./utils";

/**
 * This model contains multiple [[Layer]]s, [[Service]]s to compute
 * [[DataFrame]]s that are pushed or pulled from this model.
 * 
 * ## Usage
 * Please refer to [[ModelFactory]] for creating a new model
 */
export interface Model<In extends DataFrame, Out extends DataFrame> extends ServiceContainer, GraphImpl<In, Out> {

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
