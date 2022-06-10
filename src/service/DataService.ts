import { Serializable, SerializableMember, SerializableObject } from '../data/decorators';
import { DataServiceDriver } from './DataServiceDriver';
import { FilterQuery } from './FilterQuery';
import { FindOptions } from './FindOptions';
import { Service } from './Service';

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
 *     functionInsideNode(): void {
 *         // Get a service by its type
 *         let service = this.model.findDataService(DataObject);
 *         let service = this.model.findDataServiceByName("DataObject");
 *     }
 * }
 * ```
 */
@SerializableObject()
export abstract class DataService<I, T> extends Service {
    @SerializableMember()
    protected driver: DataServiceDriver<I, T>;
    @SerializableMember()
    priority = -1;

    constructor(dataServiceDriver?: DataServiceDriver<I, T>) {
        super();
        this.driver = dataServiceDriver;

        if (this.driver) {
            this.uid = this.driver.dataType.name;
        }

        this.once('build', this._buildDriver.bind(this));
        this.once('destroy', () => this.driver.emitAsync('destroy'));
    }

    private _buildDriver(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.driver.model = this.model;
            this.driver.logger = this.logger;
            this.driver.emitAsync('build').then(resolve).catch(reject);
        });
    }

    get dataType(): Serializable<T> {
        if (this.driver) {
            return this.driver.dataType;
        }
        return undefined;
    }

    /**
     * Set the priority of the data service
     * a higher number means a higher priority.
     *
     * @param {number} value Priority value
     * @returns {DataService} data service instance
     */
    setPriority(value: number): this {
        this.priority = value;
        return this;
    }

    findByUID(uid: I): Promise<T> {
        return this.driver.findByUID(uid);
    }

    findOne(query?: FilterQuery<T>, options?: FindOptions): Promise<T> {
        return this.driver.findOne(query, options);
    }

    findAll(query?: FilterQuery<T>, options?: FindOptions): Promise<T[]> {
        return this.driver.findAll(query, options);
    }

    insert(id: I, object: T): Promise<T> {
        return this.driver.insert(id, object);
    }

    count(query?: FilterQuery<T>): Promise<number> {
        return this.driver.count(query);
    }

    delete(id: I): Promise<void> {
        return this.driver.delete(id);
    }

    deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return this.driver.deleteAll(filter);
    }
}
