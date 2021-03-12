import { DataFrame, ReferenceSpace } from './data';
import { DataService, Service } from './service';
import { GraphShape } from './graph/GraphShape';
import { PullOptions, PushOptions } from './graph';

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
export interface Model<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame>
    extends GraphShape<In, Out> {
    /**
     * Push data to the model
     *
     * @param frame Input frame
     * @param {PushOptions} [options] Push options
     */
    push(frame: In | In[], options?: PushOptions): Promise<void>;

    /**
     * Pull data from the model
     *
     * @param {PullOptions} [options] Pull options
     */
    pull(options?: PullOptions): Promise<void>;

    /**
     * Find service
     */
    findService<F extends Service>(name: string): F;
    findService<F extends Service>(serviceClass: new () => F): F;

    /**
     * Find data service
     */
    findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(name: string): F;
    findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(dataType: new () => D): F;
    findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(object: D): F;

    /**
     * Find all services and data services
     *
     * @param {new () => Service} [q] Service class
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
    referenceSpace: ReferenceSpace;
}
