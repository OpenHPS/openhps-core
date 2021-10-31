import { Constructor } from '../data/decorators';
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
export abstract class DataService<I, T> extends Service {
    protected driver: DataServiceDriver<I, T>;

    constructor(dataServiceDriver?: DataServiceDriver<I, T>) {
        super();
        this.driver = dataServiceDriver;

        if (this.dataType) {
            this.uid = this.dataType.name;
        }

        this.once('build', () => this.driver.emitAsync('build'));
        this.once('destroy', () => this.driver.emitAsync('destroy'));
    }

    get dataType(): Constructor<T> {
        if (!this.driver) {
            return undefined;
        }
        return this.driver.dataType;
    }

    set dataType(value: Constructor<T>) {
        if (!this.driver) {
            return;
        }
        this.driver.dataType = value;
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
