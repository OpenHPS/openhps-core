import { DataFrame } from './data/DataFrame';
import { TransformationSpace } from './data/object/space/TransformationSpace';
import { DataService } from './service/DataService';
import { Service } from './service/Service';
import { Graph } from './graph/Graph';
import { Serializable } from './data/decorators';

/**
 * This model contains multiple {@link Node}s, {@link Service}s to sample
 * {@link DataFrame}s that are pushed or pulled from this model.
 *
 * ## Usage
 * ### Creation
 * Please refer to {@link ModelBuilder} for creating a new model
 *
 * ### Pushing and Pulling
 * Pushing or pulling on a model is possible, but only recommended for prototyping.
 * Instead, developers should use a {@link SourceNode} that automatically pushes new {@link DataFrame}s
 * or pushes new frames when receiving a pull.
 */
export interface Model<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame> extends Graph<In, Out> {
    /**
     * Find service
     *
     * @returns {Service} Found service
     */
    findService<S extends Service>(uid: string): S;
    findService<S extends Service>(serviceClass: Serializable<S>): S;

    /**
     * Find data service
     *
     * @returns {DataService} Found data service
     */
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(uid: string): F;
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(dataType: Serializable<D>): F;
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(object: D): F;

    /**
     * Find all services and data services
     *
     * @param {typeof Service} [serviceClass] Service class
     * @returns {Service[]} Array of all services
     */
    findAllServices<S extends Service>(serviceClass?: Serializable<S>): S[];

    /**
     * Find all data services by data type
     *
     * @param {Serializable} [dataType] data type class
     * @returns {Service[]} Array of all services
     */
    findAllDataServices<T, S extends DataService<any, T>>(dataType?: Serializable<T>): S[];

    /**
     * Destroy the model, added nodes and services
     *  Equivalent of model.emitAsync('destroy');
     */
    destroy(): Promise<boolean>;

    /**
     * Model reference space
     */
    referenceSpace: TransformationSpace;
}
