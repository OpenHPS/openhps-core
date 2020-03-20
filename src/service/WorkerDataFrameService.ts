import { DataSerializer, DataFrame } from "../data";
import { Subject } from "threads/observable";
import * as uuidv4 from 'uuid/v4';
import { isArray } from "util";
import { DataFrameService } from "./DataFrameService";

export class WorkerDataFrameService<T extends DataFrame> extends DataFrameService<T> {
    private _inputObservable: Subject<{ id: string, serviceName: string, method: string, parameters: any }>;
    private _outputObservable: Subject<{ id: string, success: boolean, result?: any}>;
    private _promises: Map<string, { resolve: (data?: any) => void, reject: (ex?: any) => void }> = new Map();

    constructor(dataType: new () => T | DataFrame = DataFrame, 
                inputObservable: Subject<{ id: string, serviceName: string, method: string, parameters: any }>, 
                outputObservable: Subject<{ id: string, success: boolean, result?: any}>,
                options?: any) {
        super(dataType, options);
        this._inputObservable = inputObservable;
        this._outputObservable = outputObservable;
        this._outputObservable.subscribe(this._onOutput.bind(this));
    }

    private _onOutput(next: { id: string, success: boolean, result?: any}): void {
        if (this._promises.has(next.id)) {
            const promise = this._promises.get(next.id);
            if (next.success) {
                if (next.result === undefined) {
                    promise.resolve();
                } else if (isArray(next.result)) {
                    const result = new Array();
                    next.result.forEach(r => {
                        if (r['__type']) {
                            result.push(DataSerializer.deserialize(r));
                        } else {
                            result.push(r);
                        }
                    });
                    promise.resolve(result);
                } else {
                    if (next.result['__type']) {
                        promise.resolve(DataSerializer.deserialize(next.result));
                    } else {
                        promise.resolve(next.result);
                    }
                }
            } else {
                promise.reject(next.result);
            }
            this._promises.delete(next.id);
        }
    }

    public findByDataObjectUID(uid: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "findByDataObjectUID",
                parameters: [uid]
            });
        });
    }

    public findBefore(timestamp: number): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "findBefore",
                parameters: [timestamp]
            });
        });
    }

    public findAfter(timestamp: number): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "findAfter",
                parameters: [timestamp]
            });
        });
    }

    public findByUID(uid: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "findByUID",
                parameters: [uid]
            });
        });
    }

    public findAll(): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "findAll",
                parameters: []
            });
        });
    }

    public insert(object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "insert",
                parameters: [DataSerializer.serialize(object)]
            });
        });
    }

    public delete(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "delete",
                parameters: [id]
            });
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const uuid = uuidv4();
            this._promises.set(uuid, { resolve, reject });
            this._inputObservable.next({
                id: uuid,
                serviceName: this.dataType.name,
                method: "deleteAll",
                parameters: []
            });
        });
    }
    
}
