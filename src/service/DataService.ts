import { DataServiceDriver } from './DataServiceDriver';
import { FilterQuery } from './FilterQuery';
import { FindOptions } from './FindOptions';
import { IndexType } from './IndexType';

/**
 * DataService
 *
 * ## Usage
 *
 * ### Finding a DataService
 * ```typescript
 * import { Node, DataFrame } from '@openhps/core';
 *
 * export class CustomNode extends Node<DataFrame> {
 *     // Data services can be found in any function inside a node
 *     // that is added to a model
 *     public functionInsideNode(): void {
 *         // Get a service by its type
 *         let service = this.model.findDataService(DataObject);
 *         let service = this.model.findDataServiceByName("DataObject");
 *     }
 * }
 * ```
 */
export abstract class DataService<I, T> extends DataServiceDriver<I, T> {
    protected driver: DataServiceDriver<I, T>;

    constructor(dataServiceDriver?: DataServiceDriver<I, T>) {
        super(dataServiceDriver ? dataServiceDriver.dataType : undefined);
        this.driver = dataServiceDriver;

        this.once('build', () => this.driver.emitAsync('build'));
        this.once('destroy', () => this.driver.emitAsync('destroy'));
    }

    public createIndex(key: string, type?: IndexType): Promise<void> {
        return this.driver.createIndex(key, type);
    }

    public findByUID(uid: I): Promise<T> {
        return this.driver.findByUID(uid);
    }

    public findOne(query?: FilterQuery<T>, options?: FindOptions): Promise<T> {
        return this.driver.findOne(query, options);
    }

    public findAll(query?: FilterQuery<T>, options?: FindOptions): Promise<T[]> {
        return this.driver.findAll(query, options);
    }

    public insert(id: I, object: T): Promise<T> {
        return this.driver.insert(id, object);
    }

    public count(query?: FilterQuery<T>): Promise<number> {
        return this.driver.count(query);
    }

    public delete(id: I): Promise<void> {
        return this.driver.delete(id);
    }

    public deleteAll(): Promise<void> {
        return this.driver.deleteAll();
    }
}
