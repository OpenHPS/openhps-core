import { DataServiceDriver } from "./DataServiceDriver";
import { FilterQuery } from "./FilterQuery";
import { QueryEvaluator } from "./QueryEvaluator";

export class MemoryDataService<I, T> extends DataServiceDriver<I, T> {
    protected _data: Map<I, T> = new Map();

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._data.has(uid)) {
                resolve(this._data.get(uid));
            } else {
                reject(`${this.dataType.name} with identifier #${uid} not found!`);
            }
        });
    }

    public findOne(query?: FilterQuery<T>): Promise<T> {
        return new Promise<T>(resolve => {
            for (const [, object] of this._data) {
                if (QueryEvaluator.evaluate(object, query))
                    return resolve(object);
            }
            return resolve();
        });
    }

    public findAll(query?: FilterQuery<T>): Promise<T[]> {
        return new Promise<T[]>(resolve => {
            const data: T[] = [];
            this._data.forEach(object => {
                if (QueryEvaluator.evaluate(object, query))
                    data.push(object);
            });
            resolve(data);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>(resolve => {
            if (id && object) {
                this._data.set(id, object);
                resolve(object);
            } else {
                resolve();
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

    public deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return new Promise<void>(resolve => {
            if (filter === undefined) {
                this._data = new Map();
            } else {
                for (const [key, value] of this._data) {
                    if (QueryEvaluator.evaluate(value, filter)) {
                        this.delete(key);
                    }
                }
            }
            resolve();
        });
    }
    
}
