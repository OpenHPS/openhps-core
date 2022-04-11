import { Constructor, DataServiceOptions, FilterQuery, FindOptions, MemoryDataService } from '../../../src';

export class SlowMemoryDataService<I, T> extends MemoryDataService<I, T> {
    protected _data: Map<I, any> = new Map();
    protected options: SlowMemoryDataServiceOptions<T>;

    constructor(dataType: Constructor<T>, options?: SlowMemoryDataServiceOptions<T>) {
        super(dataType, options);
        this.options.timeout = this.options.timeout ?? 200;
    }

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                super.findByUID(uid).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public findOne(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                super.findOne(query, options).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public findAll(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            setTimeout(() => {
                super.findAll(query, options).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                super.insert(id, object).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public delete(id: I): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                super.delete(id).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public count(filter?: FilterQuery<T>): Promise<number> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                super.count(filter).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                super.deleteAll(filter).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }
}

export interface SlowMemoryDataServiceOptions<T> extends DataServiceOptions<T> {
    timeout?: number;
}
