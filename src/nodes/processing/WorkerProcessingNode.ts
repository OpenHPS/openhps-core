import { DataFrame } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { spawn, Thread, Worker } from "threads";
import { GraphPushOptions } from "../../graph";
import { DataSerializer } from "../../data/DataSerializer";

/**
 * Processing node that uses threads
 * 
 * ## Usage
 * ```typescript
 * const processingNode = new WorkerProcessingNode('workerfile.ts');
 * ```
 * The worker is spawned upon building the model.
 */
export class WorkerProcessingNode<In extends DataFrame, Out extends DataFrame> extends ProcessingNode<In, Out> {
    private _worker: Worker;
    private _workerFn: (data: In, options?: GraphPushOptions) => Promise<Out>;
    private _thread: Thread;
    
    constructor(workerFile: string) {
        super();
        this._worker = new Worker(workerFile, {});

        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
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
                this._workerFn = (thread as any).process;
                this.logger('debug', {
                    message: "Worker thread spawned!",
                });
                resolve();
                this.emit('ready');
            }).catch((ex: any) => {
                reject(ex);
            });
        });
    }

    public process(data: In, options?: GraphPushOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            if (this._workerFn === undefined) {
                reject("Worker thread not spawned yet!");
            }

            this._workerFn(DataSerializer.serialize(data), options).then((result: any) => {
                resolve(DataSerializer.deserialize(result) as Out);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}
