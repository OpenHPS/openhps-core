import { DataSerializer } from '../data/DataSerializer';
import { Subject } from 'threads/observable';
import { v4 as uuidv4 } from 'uuid';
import { ServiceProxy } from './_internal';
import { Service } from './Service';

/**
 * A worker service proxy will forward function calls to an observable.
 * This observable can be a remote process or worker. It is mainly used
 * to proxy function calls from a worker thread to the main thread.
 */
export class WorkerServiceProxy extends ServiceProxy<Service> {
    protected options: WorkerProxyOptions;
    private _promises: Map<string, { resolve: (data?: any) => void; reject: (ex?: any) => void }> = new Map();

    constructor(options?: WorkerProxyOptions) {
        super();
        this.options = options;
        this.uid = options.uid;
        if (this.options.responseObservable) {
            this.options.responseObservable.subscribe(this._onOutput.bind(this));
        }
    }

    private _onOutput(next: { id: string; success: boolean; result?: any }): void {
        if (this._promises.has(next.id)) {
            const promise = this._promises.get(next.id);
            if (next.success) {
                if (next.result === undefined) {
                    promise.resolve();
                } else if (Array.isArray(next.result)) {
                    const result: Array<any> = [];
                    next.result.forEach((r) => {
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

    public get?(target: Service, p: PropertyKey): any {
        const ownResult = (this as any)[p];
        if (ownResult) {
            return ownResult;
        }
        return this.createHandler(target, p);
    }

    /**
     * Create handler function for a specific property key
     *
     * @param {Service} target Target service
     * @param {string|number|symbol} p Property
     * @returns {Function} Handler function
     */
    public createHandler(target: Service, p: PropertyKey): (...args: any[]) => any {
        return (...args: any[]) =>
            new Promise<any>((resolve, reject) => {
                const uuid = uuidv4();
                this._promises.set(uuid, { resolve, reject });
                const serializedArgs: Array<any> = [];
                args.forEach((arg) => {
                    if (DataSerializer.findTypeByName(arg.constructor.name)) {
                        serializedArgs.push(DataSerializer.serialize(arg));
                    } else {
                        serializedArgs.push(arg);
                    }
                });
                // Service call
                const call = {
                    id: uuid,
                    serviceName: this.uid,
                    method: p as string,
                    parameters: serializedArgs,
                };
                if (this.options.callObservable) {
                    // Forward call to observable
                    this.options.callObservable.next(call);
                } else {
                    // Forward call to promise
                    this.options
                        .callFunction(call)
                        .then((response) => {
                            this._onOutput(response);
                        })
                        .catch((response) => {
                            this._onOutput(response);
                        });
                }
            });
    }
}

interface WorkerProxyOptions {
    uid: string;
    callFunction?: (call: WorkerServiceCall) => Promise<WorkerServiceResponse>;
    callObservable?: Subject<WorkerServiceCall>;
    responseObservable?: Subject<WorkerServiceResponse>;
}

export interface WorkerServiceCall {
    id: string;
    serviceName: string;
    method: string;
    parameters: any;
}

export interface WorkerServiceResponse {
    id: string;
    success: boolean;
    result?: any;
}
