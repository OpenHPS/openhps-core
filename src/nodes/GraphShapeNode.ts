import { DataFrame } from '../data';
import { GraphBuilder, PullOptions, PushOptions } from '../graph';
import { GraphNode } from '../graph/_internal/GraphNode';
import { GraphShape } from '../graph/_internal/implementations';

export class GraphShapeNode<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame> extends GraphNode<
    In,
    Out
> {
    protected builder: GraphBuilder<In, Out>;

    constructor() {
        super();
        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.builder
                .build()
                .then(() => resolve())
                .catch(reject);
        });
    }

    private _onDestroy(): Promise<boolean> {
        return this.builder.graph.emitAsync('destroy');
    }

    /**
     * Send a pull request to the node
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    public pull(options?: PullOptions): Promise<void> {
        return this.builder.graph.pull(options);
    }

    /**
     * Push data to the node
     *
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(data: In | In[], options: PushOptions = {}): Promise<void> {
        return this.builder.graph.push(data, options);
    }

    public get processingGraph(): GraphShape<In, Out> {
        return this.builder.graph;
    }
}
