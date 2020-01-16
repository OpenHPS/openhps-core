import { DataFrame } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { spawn, Thread, Worker } from "threads";
import { GraphPushOptions } from "../../graph";

/**
 * Processing node that uses threads from {@link threads#Thread | Thread}.
 * 
 * ## Usage
 * ```typescript
 * 
 * ```
 */
export class WorkerProcessingNode<In extends DataFrame, Out extends DataFrame> extends ProcessingNode<In, Out> {
    private _worker: Worker;
    private _workerFn: (data: In, options?: GraphPushOptions) => Promise<Out>;
    private _thread: Thread;

    constructor(workerFile: string) {
        super();
        // this._worker = new Worker(`require('ts-node').register(); require('${workerFile}'));`, {

        // });
        this._worker = new Worker(workerFile);

        this.on('build', this._onBuild.bind(this));
        this.on('destroy', this._onDestroy.bind(this));
    }

    private _onDestroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._thread === undefined) {
                return resolve();
            }
            Thread.terminate(this._thread).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getLogger()('debug', {
                message: "Spawning new worker thread ..."
            });
            spawn(this._worker).then((thread: Thread) => {
                this._thread = thread;
                this._workerFn = (thread as any).process;
                this.getLogger()('debug', {
                    message: "Worker thread spawned!",
                });
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public process(data: In, options?: GraphPushOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            if (this._workerFn === undefined) {
                reject("Worker thread not spawned yet!");
            }
            this._workerFn(data, options).then((result: Out) => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}
