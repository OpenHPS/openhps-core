import { DataServiceDriver, DataServiceOptions } from './DataServiceDriver';
import { FilterQuery } from './FilterQuery';
import { FindOptions } from './FindOptions';
import { MemoryQueryEvaluator } from './MemoryQueryEvaluator';

export class MemoryDataService<I, T> extends DataServiceDriver<I, T> {
    protected _data: Map<I, any> = new Map();

    constructor(dataType: new () => T, options?: DataServiceOptions<T>) {
        super(dataType, options);
    }

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._data.has(uid)) {
                resolve(this.options.deserialize(this._data.get(uid)));
            } else {
                reject(`${this.dataType.name} with identifier #${uid} not found!`);
            }
        });
    }

    public findOne(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.findAll(query, {
                limit: 1,
                sort: options.sort,
            })
                .then((results) => {
                    if (results.length > 0) {
                        return resolve(results[0]);
                    } else {
                        resolve(undefined);
                    }
                })
                .catch(reject);
        });
    }

    public findAll(query?: FilterQuery<T>, options: FindOptions = {}): Promise<T[]> {
        return new Promise<T[]>((resolve) => {
            options.limit = options.limit || this._data.size;
            let data: T[] = [];
            this._data.forEach((object) => {
                if (MemoryQueryEvaluator.evaluate(object, query)) {
                    data.push(object);
                    if (!options.sort && data.length >= options.limit) {
                        return;
                    }
                }
            });
            if (options.sort) {
                data = data
                    .sort((a, b) =>
                        options.sort
                            .map((s) => {
                                const res1 = MemoryQueryEvaluator.getValueFromPath(s[1] > 0 ? a : b, s[0])[1];
                                const res2 = MemoryQueryEvaluator.getValueFromPath(s[1] > 0 ? b : a, s[0])[1];
                                if (typeof res1 === 'number') {
                                    return res1 - res2;
                                } else if (typeof res1 === 'string') {
                                    return res1.localeCompare(res2);
                                } else {
                                    return 0;
                                }
                            })
                            .reduce((a, b) => a + b),
                    )
                    .slice(0, options.limit);
            }
            data = data.map(this.options.deserialize);
            resolve(data);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve) => {
            if (id && object) {
                this._data.set(id, this.options.serialize(object));
                resolve(object);
            } else {
                resolve(undefined);
            }
        });
    }

    public delete(id: I): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._data.has(id)) {
                this._data.delete(id);
                resolve();
            } else {
                reject(`Unable to delete! ${this.dataType.name} with identifier #${id} not found!`);
            }
        });
    }

    public count(filter?: FilterQuery<T>): Promise<number> {
        return new Promise((resolve) => {
            if (filter === undefined) {
                resolve(this._data.size);
            } else {
                let count = 0;
                for (const [, value] of this._data) {
                    if (MemoryQueryEvaluator.evaluate(value, filter)) {
                        count++;
                    }
                }
                resolve(count);
            }
        });
    }

    public deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return new Promise((resolve) => {
            if (filter === undefined) {
                this._data = new Map();
            } else {
                for (const [key, value] of this._data) {
                    if (MemoryQueryEvaluator.evaluate(value, filter)) {
                        this.delete(key);
                    }
                }
            }
            resolve();
        });
    }
}
