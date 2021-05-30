import { RemoteNode, RemoteNodeOptions } from '../RemoteNode';
import { DataFrame } from '../../data/DataFrame';
import { Edge } from '../../graph/Edge';
import { ModelBuilder } from '../../ModelBuilder';
import { RemoteNodeService } from '../../service/RemoteNodeService';
import { SourceNode, SourceNodeOptions } from '../SourceNode';

/**
 * Remote source node
 */
export class RemoteSourceNode<Out extends DataFrame, S extends RemoteNodeService> extends SourceNode<Out> {
    protected remoteNode: RemoteNode<Out, Out, S>;

    constructor(options?: SourceNodeOptions & RemoteNodeOptions) {
        super(options);
        this.remoteNode = new RemoteNode<Out, Out, S>(options);
        this.uid = `${this.uid}-source`;

        this.once('build', this._onRemoteBuild.bind(this));
    }

    private _onRemoteBuild(graphBuilder: ModelBuilder<any, any>): Promise<boolean> {
        // Add a remote node before this node
        this.remoteNode.graph = this.graph;
        this.remoteNode.logger = this.logger;
        graphBuilder.addNode(this.remoteNode);
        graphBuilder.addEdge(new Edge(this.remoteNode, this));
        return this.remoteNode.emitAsync('build', graphBuilder);
    }

    public onPull(): Promise<Out> {
        return new Promise((resolve, reject) => {
            this.remoteNode
                .pull()
                .then(() => {
                    resolve(undefined);
                })
                .catch(reject);
        });
    }
}
