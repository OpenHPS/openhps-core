import { DataService } from "./DataService";
import { DataFrame } from "../data";

export class DataFrameService<T extends DataFrame | DataFrame> extends DataService<T> {
    protected _frames: Map<string, T> = new Map();

    constructor(dataType: new () => T | DataFrame = DataFrame) {
        super(dataType as new () => T);
    }

    public findById(uid: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._frames.has(uid)) {
                resolve(this._frames.get(uid));
            } else {
                reject(`Data frame with uid ${uid} not found!`);
            }
        });
    }

    public findAll(): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve(Array.from(this._frames.values()));
        });
    }

    public insert(object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (object.uid !== null && this._frames.has(object.uid)) {
                this._frames.set(object.uid, object);
                resolve(object);
            } else {
                this._frames.set(object.uid, object);
                resolve(object);
            }
        });
    }

    public update(object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            // Update existing data
            if (this._frames.has(object.uid)) {
                // Update existing data
                this._frames.set(object.uid, object);
                resolve(object);
            } else {
                this._frames.set(object.uid, object);
                resolve(object);
            }
        });
    }

    public delete(uid: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._frames.has(uid)) {
                this._frames.delete(uid);
                resolve();
            } else {
                reject(`Unable to delete! Data frame with uid ${uid} not found!`);
            }
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._frames = new Map();
            resolve();
        });
    }
}
