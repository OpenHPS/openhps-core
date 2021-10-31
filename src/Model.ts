import { DataFrame } from './data/DataFrame';
import { TransformationSpace } from './data/object/space/TransformationSpace';
import { DataService } from './service/DataService';
import { Service } from './service/Service';
import { Graph } from './graph/Graph';

/**
 * This model contains multiple [[Node]]s, [[Service]]s to sample
 * [[DataFrame]]s that are pushed or pulled from this model.
 *
 * ## Usage
 * ### Creation
 * Please refer to [[ModelBuilder]] for creating a new model
 *
 * ### Pushing and Pulling
 * Pushing or pulling on a model is possible, but only recommended for prototyping.
 * Instead, developers should use a [[SourceNode]] that automatically pushes new [[DataFrame]]s
 * or pushes new frames when receiving a pull.
 */
export interface Model<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame> extends Graph<In, Out> {
    /**
     * Find service
     *
     * @returns {Service} Found service
     */
    findService<F extends Service>(name: string): F;
    findService<F extends Service>(serviceClass: new () => F): F;

    /**
     * Find data service
     *
     * @returns {DataService} Found data service
     */
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(name: string): F;
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(dataType: new () => D): F;
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(object: D): F;

    /**
     * Find all services and data services
     *
     * @param {typeof Service} [q] Service class
     * @returns {Service[]} Array of all services
     */
    findAllServices<S extends Service>(q?: new () => S): S[];

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
