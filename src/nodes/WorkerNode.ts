import { DataFrame, DataSerializer } from "../data"
import { GraphPushOptions, GraphPullOptions } from "../graph";
import { Node } from "../Node";
import { ModelBuilder } from "../ModelBuilder";
import * as fs from 'fs';
import { Thread, Worker, spawn } from "threads";
import { Observable } from "threads/observable";

/**
 * 
 * ## Usage
 * 
 * ### Absolute Imports
 * ```typescript
 * const workerNode = new WorkerNode((builder) => {
 *      const TimeConsumingNode = require('@openhps/abc');
 *      builder.to(new TimeConsumingNode());
 * });
 * ```
 * 
 * ### Relative Imports
 * ```typescript
 * const workerNode = new WorkerNode((builder) => {
 *      const TimeConsumingNode = require(path.join(__dirname, '../TimeConsumingNode'));
 *      builder.to(new TimeConsumingNode());
 * }, __dirname);
 * ```
 */
export class WorkerNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {
    private _worker: Worker;
    private _pushFn: (data: In, options?: GraphPushOptions) => Promise<void>;
    private _pullFn: (options?: GraphPullOptions) => Promise<void>;
    private _initFn: (workerData: any) => Promise<void>;
    private _inputFn: () => Observable<{ options?: GraphPullOptions }>;
    private _outputFn: () => Observable<{ data: any, options?: GraphPushOptions }>;
    private _thread: Thread;
    private _builderCallback: (builder: ModelBuilder<any, any>) => void;
    private _dirname: string;

    constructor(builderCallback: (builder: ModelBuilder<any, any>) => void, dirname: string = __dirname) {
        super();
        this._builderCallback = builderCallback;
        this._dirname = dirname;

        const workerJS = '_internal/WorkerNodeRunner.js';
        const workerTS = '_internal/WorkerNodeRunner.ts';
        if (fs.existsSync(workerJS)) {
            this._worker = new Worker(workerJS);
        } else {
            this._worker = new Worker(workerTS);
        }
        
        this.on('build', this._onBuild.bind(this));
        this.on('destroy', this._onDestroy.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.on('push', this._onPush.bind(this));
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._pullFn(DataSerializer.serialize(options)).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._pushFn(DataSerializer.serialize(data), DataSerializer.serialize(options)).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onDestroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._thread === undefined) {
                return resolve();
            }
            Thread.terminate(this._thread).then((_: any) => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.logger('debug', {
                message: "Spawning new worker thread ..."
            });
            spawn(this._worker).then((thread: Thread) => {
                this._thread = thread;
                this._pushFn = (thread as any).push;
                this._pullFn = (thread as any).pull;
                this._initFn = (thread as any).init;
                this._outputFn = (thread as any).output;
                this._inputFn = (thread as any).input;

                this.logger('debug', {
                    message: "Worker thread spawned!",
                });

                this._inputFn().subscribe((value: any) => {
                    const pullPromises = new Array();
                    this.inputNodes.forEach(node => {
                        pullPromises.push(node.pull(DataSerializer.deserialize(value.options)));
                    });
    
                    Promise.all(pullPromises);
                });
                this._outputFn().subscribe((value: any) => {
                    const pushPromises = new Array();
                    this.outputNodes.forEach(node => {
                        pushPromises.push(node.push(DataSerializer.deserialize(value.data), DataSerializer.deserialize(value.options)));
                    });
    
                    Promise.all(pushPromises);
                });

                return this._initFn({
                    dirname: this._dirname,
                    builderCallback: this._builderCallback.toString()
                });
            }).then(_ => {
                resolve();
            }).catch((ex: any) => {
                reject(ex);
            });
        });
    }
}
