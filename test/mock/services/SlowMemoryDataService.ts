import { Constructor, DataServiceOptions, FilterQuery, FindOptions, MemoryDataService } from '../../../src';

export class SlowMemoryDataService<I, T> extends MemoryDataService<I, T> {
    protected _data: Map<I, any> = new Map();
    protected options: SlowMemoryDataServiceOptions<T>;
    protected driverReady: boolean = false;

    constructor(dataType: Constructor<T>, options?: SlowMemoryDataServiceOptions<T>) {
        super(dataType, options);
        this.options.timeout = this.options.timeout ?? 200;
        this.once('build', this._onBuild.bind(this));
    }

    _onBuild(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.driverReady = true;
                resolve();
            }, this.options.timeout);
        });
    }

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (!this.driverReady) {
                reject(new Error(`Not ready`));
            }
            setTimeout(() => {
                super.findByUID(uid).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public findOne(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (!this.driverReady) {
                reject(new Error(`Not ready`));
            }
            setTimeout(() => {
                super.findOne(query, options).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public findAll(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            if (!this.driverReady) {
                reject(new Error(`Not ready`));
            }
            setTimeout(() => {
                super.findAll(query, options).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (!this.driverReady) {
                reject(new Error(`Not ready`));
            }
            setTimeout(() => {
                super.insert(id, object).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public delete(id: I): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.driverReady) {
                reject(new Error(`Not ready`));
            }
            setTimeout(() => {
                super.delete(id).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public count(filter?: FilterQuery<T>): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.driverReady) {
                reject(new Error(`Not ready`));
            }
            setTimeout(() => {
                super.count(filter).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }

    public deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.driverReady) {
                reject(new Error(`Not ready`));
            }
            setTimeout(() => {
                super.deleteAll(filter).then(resolve).catch(reject);
            }, this.options.timeout);
        });
    }
}

export interface SlowMemoryDataServiceOptions<T> extends DataServiceOptions<T> {
    timeout?: number;
}
