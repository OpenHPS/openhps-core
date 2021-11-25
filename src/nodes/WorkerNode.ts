import { DataFrame, DataSerializer } from '../data';
import { Node, NodeOptions } from '../Node';
import { GraphShapeBuilder } from '../graph/builders/GraphBuilder';
import { ModelBuilder } from '../ModelBuilder';
import { PullOptions, PushOptions } from '../graph/options';
import { WorkerOptions } from '../worker/WorkerOptions';
import { WorkerHandler } from '../worker';

/**
 * Worker nodes are normal nodes that initialize multiple web workers.
 * Push and pull requests are forwarded to these web workers.
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
 * }, { directory: __dirname });
 * ```
 *
 * ### Web Worker
 * Web workers can be used by specifying the worker file.
 * ```typescript
 * const workerNode = new WorkerNode((builder) => {
 *      const TimeConsumingNode = require(path.join(__dirname, '../TimeConsumingNode'));
 *      builder.to(new TimeConsumingNode());
 * }, {
 *      worker: 'worker.openhps-core.min.js'    // Worker JS file
 * });
 * ```
 *
 * @category Node
 */
export class WorkerNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {
    protected options: WorkerNodeOptions;
    protected config: any = {};
    protected handler: WorkerHandler;

    constructor(node: Node<In, Out>, options?: WorkerNodeOptions);
    constructor(
        builderCallback: (
            builder: GraphShapeBuilder<ModelBuilder<any, any>>,
            modelBuilder?: ModelBuilder<any, any>,
            args?: any,
        ) => void,
        options?: WorkerNodeOptions,
    );
    constructor(file: string, options?: WorkerNodeOptions);
    constructor(worker: ((...args: any[]) => void) | string | Node<In, Out>, options?: WorkerNodeOptions) {
        super(options);
        this.options.worker = this.options.worker || '../worker/WorkerRunner';
        if (worker instanceof Node) {
            // Serializable node
            this.config.serialized = DataSerializer.serialize(worker);
        } else if (worker instanceof Function) {
            // Code
            this.config.builder = worker.toString();
            if (this.options.typescript) {
                // eslint-disable-next-line
                this.config.builder = require('typescript').transpile(this.config.builder);
            }
        } else {
            this.config.shape = worker;
        }

        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.on('push', this._onPush.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.handler = new WorkerHandler(this.model, this.options, this.config);
            this.handler.on('push', this._onWorkerPush.bind(this));
            this.handler.on('pull', this._onWorkerPull.bind(this));
            this.handler.on('event', this._onWorkerEvent.bind(this));
            this.handler.build().then(resolve).catch(reject);
        });
    }

    private _onDestroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.handler.destroy().then(resolve).catch(reject);
        });
    }

    private _onPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.options.optimizedPull) {
                // Do not pass the pull request to the worker
                Promise.all(this.inlets.map((inlet) => inlet.pull(options)))
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            } else {
                this.handler.pull(options).then(resolve).catch(reject);
            }
        });
    }

    private _onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        return this.handler.push(frame, options);
    }

    private _onWorkerEvent(value: { name: string; event: any }): void {
        this.inlets.map((inlet) => inlet.emit(value.name, value.event));
    }

    /**
     * Triggered for each worker that requests a pull
     *
     * @param {PullOptions} options Pull options
     */
    private _onWorkerPull(options?: PullOptions): void {
        this.inlets.forEach((inlet) => inlet.pull(options));
    }

    /**
     * Triggered for each worker that pushes data
     *
     * @param {DataFrame} frame Deserialized frame
     * @param {PushOptions} options Push options
     */
    private _onWorkerPush(frame: DataFrame, options?: PushOptions): void {
        this.outlets.forEach((outlet) => outlet.push(frame as any, options));
    }
}

export interface WorkerNodeOptions extends NodeOptions, WorkerOptions {
    /**
     * Pull requests skip the worker
     */
    optimizedPull?: boolean;
}
