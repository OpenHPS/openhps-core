import { DataSerializer } from '../data';
import { DataServiceDriver } from './DataServiceDriver';
import { FilterQuery } from './FilterQuery';
import { MemoryQueryEvaluator } from './_internal/MemoryQueryEvaluator';

export class MemoryDataService<I, T> extends DataServiceDriver<I, T> {
    protected _data: Map<I, any> = new Map();

    protected serialize: (obj: T) => any;
    protected deserialize: (obj: any) => T;

    constructor(
        dataType: new () => T,
        serializer: (obj: T) => any = (obj) => DataSerializer.serialize(obj),
        deserializer: (obj: any) => T = (obj) => DataSerializer.deserialize(obj),
    ) {
        super(dataType);
        this.serialize = serializer;
        this.deserialize = deserializer;
    }

    public createIndex(_: string): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._data.has(uid)) {
                resolve(this.deserialize(this._data.get(uid)));
            } else {
                reject(`${this.dataType.name} with identifier #${uid} not found!`);
            }
        });
    }

    public findOne(query?: FilterQuery<T>): Promise<T> {
        return new Promise<T>((resolve) => {
            for (const [, object] of this._data) {
                if (MemoryQueryEvaluator.evaluate(object, query)) {
                    return resolve(this.deserialize(object));
                }
            }
            return resolve(undefined);
        });
    }

    public findAll(query?: FilterQuery<T>): Promise<T[]> {
        return new Promise<T[]>((resolve) => {
            const data: T[] = [];
            this._data.forEach((object) => {
                if (MemoryQueryEvaluator.evaluate(object, query)) {
                    data.push(this.deserialize(object));
                }
            });
            resolve(data);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve) => {
            if (id && object) {
                this._data.set(id, this.serialize(object));
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

    public deleteAll(filter?: FilterQuery<T>): Promise<void> {
        return new Promise<void>((resolve) => {
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
