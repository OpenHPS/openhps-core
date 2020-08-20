import { DataServiceDriver } from './DataServiceDriver';
import { FilterQuery } from './FilterQuery';

export abstract class DataService<I, T> extends DataServiceDriver<I, T> {
    protected driver: DataServiceDriver<I, T>;

    constructor(dataServiceDriver: DataServiceDriver<I, T>) {
        super(dataServiceDriver.dataType);
        this.driver = dataServiceDriver;

        this.once('build', () => this.driver.emitAsync('build'));
        this.once('destroy', () => this.driver.emitAsync('destroy'));
    }

    public findByUID(uid: I): Promise<T> {
        return this.driver.findByUID(uid);
    }

    public findOne(query?: FilterQuery<T>): Promise<T> {
        return this.driver.findOne(query);
    }

    public findAll(query?: FilterQuery<T>): Promise<T[]> {
        return this.driver.findAll(query);
    }

    public insert(id: I, object: T): Promise<T> {
        return this.driver.insert(id, object);
    }

    public delete(id: I): Promise<void> {
        return this.driver.delete(id);
    }

    public deleteAll(): Promise<void> {
        return this.driver.deleteAll();
    }
}
