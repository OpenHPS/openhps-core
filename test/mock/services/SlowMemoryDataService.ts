import { Constructor, DataServiceOptions, FilterQuery, FindOptions, MemoryDataService } from '../../../src';

export class SlowMemoryDataService<I, T> extends MemoryDataService<I, T> {
    protected _data: Map<I, any> = new Map();

    constructor(dataType: Constructor<T>, options?: DataServiceOptions<T>) {
        super(dataType, options);
    }

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                super.findByUID(uid).then(resolve).catch(reject);
            }, 200);
        });
    }

    public findOne(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                super.findOne(query, options).then(resolve).catch(reject);
            }, 200);
        });
    }

    public findAll(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            setTimeout(() => {
                super.findAll(query, options).then(resolve).catch(reject);
            }, 200);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            setTimeout(() => {
                super.insert(id, object).then(resolve).catch(reject);
            }, 200);
        });
    }

    public delete(id: I): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                super.delete(id).then(resolve).catch(reject);
            }, 200);
        });
    }

    public count(filter?: FilterQuery<T>): Promise<number> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                super.count(filter).then(resolve).catch(reject);
            }, 200);
        });
    }

    public deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                super.deleteAll(filter).then(resolve).catch(reject);
            }, 200);
        });
    }
}
