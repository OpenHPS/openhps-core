import { DataFrame } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { spawn, Thread, Worker, expose } from "threads";
import { GraphPushOptions } from "../../graph";

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
    private _outputType: new () => Out | DataFrame;
    
    constructor(workerFile: string, outputType: new () => Out | DataFrame = DataFrame) {
        super();
        this._worker = new Worker(workerFile);
        this._outputType = outputType;

        this.on('build', this._onBuild.bind(this));
        this.on('destroy', this._onDestroy.bind(this));
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
            this._workerFn(data.toJson(), options).then((result: any) => {
                resolve(DataFrame.deserialize(result, this._outputType) as Out);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}
