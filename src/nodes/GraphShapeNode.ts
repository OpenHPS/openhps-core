import { DataFrame } from '../data';
import { PullOptions, PushOptions } from '../graph/options';
import { Node, NodeOptions } from '../Node';
import { GraphBuilder } from '../graph/builders/GraphBuilder';
import { Graph } from '../graph/Graph';

/**
 * Graph shape node is a node that contains multiple nodes on itself. Other than a constructed
 * graph shape, this type of node should offer a collection of nodes. An example could be a "PDRProcessingNode"
 * that performs pedestrian dead reckoning by combining multiple internal nodes, such as an AccelerationProcessing,
 * VelocityProcessingNode and StepDetection.
 */
export abstract class GraphShapeNode<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame> extends Node<
    In,
    Out
> {
    private _builder: GraphBuilder<In, Out>;
    private _graph: Graph<In, Out>;

    constructor(options?: GraphShapeNodeOptions) {
        super(options);
        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.construct(this._builder);
            this._builder
                .build()
                .then((graph) => {
                    this._graph = graph;
                    this._builder = null;
                    resolve();
                })
                .catch(reject);
        });
    }

    private _onDestroy(): Promise<boolean> {
        return this._graph.emitAsync('destroy');
    }

    abstract construct(builder: GraphBuilder<In, Out>): GraphBuilder<In, Out>;

    /**
     * Send a pull request to the node
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    public pull(options?: PullOptions): Promise<void> {
        return this._graph.pull(options);
    }

    /**
     * Push data to the node
     *
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(data: In | In[], options: PushOptions = {}): Promise<void> {
        return this._graph.push(data, options);
    }

    public get processingGraph(): Graph<In, Out> {
        return this._graph;
    }
}

export type GraphShapeNodeOptions = NodeOptions;
