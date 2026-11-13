import {
    Serializable,
    SerializableChangelog,
    SerializableMember,
    SerializableObject,
    createChangeLog,
} from '../data/decorators';
import { DataServiceDriver, DataServiceOptions } from './DataServiceDriver';
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

        if (this.driver && this.driver.dataType) {
            this.uid = this.driver.dataType.name;
        }

        this.once('build', this._buildDriver.bind(this));
        this.once('destroy', this._destroyDriver.bind(this));
    }

    private _buildDriver(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.driver) {
                this.driver.model = this.model;
                this.driver
                    .emitAsync('build')
                    .then(() => resolve())
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }

    private _destroyDriver(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.driver) {
                this.driver
                    .emitAsync('destroy')
                    .then(() => resolve())
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }

    get dataType(): Serializable<T> {
        if (this.driver) {
            return this.driver.dataType;
        }
        return undefined;
    }

    get driverOptions(): DataServiceOptions {
        if (this.driver) {
            return this.driver['options'];
        }
        return undefined;
    }

    /**
     * Set the priority of the data service
     * a higher number means a higher priority.
     * @param {number} value Priority value
     * @returns {DataService} data service instance
     */
    setPriority(value: number): this {
        this.priority = value;
        return this;
    }

    /**
     * Wrap a result in a changelog when the driver is configured to keep one
     * @param {any} object Object to wrap
     * @returns {any} Wrapped or original object
     */
    protected wrap(object: any): T | (T & SerializableChangelog) {
        if (this.driver && this.driverOptions.keepChangelog) {
            return typeof object === 'object' ? createChangeLog(object) : object;
        }
        return object;
    }

    findByUID(uid: I): Promise<T | (T & SerializableChangelog)> {
        return new Promise((resolve, reject) => {
            this.driver
                .findByUID(uid)
                .then((object) => {
                    resolve(this.wrap(object));
                })
                .catch(reject);
        });
    }

    findOne(query?: FilterQuery<T>, options?: FindOptions): Promise<T | (T & SerializableChangelog)> {
        return new Promise((resolve, reject) => {
            this.driver
                .findOne(query, options)
                .then((object) => {
                    resolve(this.wrap(object));
                })
                .catch(reject);
        });
    }

    findAll(query?: FilterQuery<T>, options?: FindOptions): Promise<(T | (T & SerializableChangelog))[]> {
        return new Promise((resolve, reject) => {
            this.driver
                .findAll(query, options)
                .then((objects) => {
                    resolve(objects.map((o) => this.wrap(o)));
                })
                .catch(reject);
        });
    }

    insert(id: I, object: T | (T & SerializableChangelog)): Promise<T | (T & SerializableChangelog)> {
        return new Promise((resolve, reject) => {
            this.driver
                .insert(id, object)
                .then((object) => {
                    resolve(this.wrap(object));
                })
                .catch(reject);
        });
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
