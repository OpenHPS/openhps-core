import { RemoteNode, RemoteNodeOptions } from '../RemoteNode';
import { DataFrame } from '../../data/DataFrame';
import { Edge } from '../../graph/Edge';
import { ModelBuilder } from '../../ModelBuilder';
import { RemoteNodeService } from '../../service/RemoteNodeService';
import { SourceNode, SourceNodeOptions } from '../SourceNode';

export class RemoteSourceNode<Out extends DataFrame, S extends RemoteNodeService> extends SourceNode<Out> {
    private _remoteNode: RemoteNode<Out, Out, S>;

    constructor(options?: SourceNodeOptions & RemoteNodeOptions) {
        super(options);
        this._remoteNode = new RemoteNode<Out, Out, S>(options);

        this.once('build', this._onRemoteBuild.bind(this));
    }

    private _onRemoteBuild(graphBuilder: ModelBuilder<any, any>): Promise<boolean> {
        // Add a remote node before this node
        this._remoteNode.graph = this.graph;
        this._remoteNode.logger = this.logger;
        graphBuilder.addNode(this._remoteNode);
        graphBuilder.addEdge(new Edge(this._remoteNode, this));
        return this._remoteNode.emitAsync('build', graphBuilder);
    }

    public onPull(): Promise<Out> {
        return new Promise((resolve, reject) => {
            this._remoteNode
                .pull()
                .then(() => {
                    resolve(undefined);
                })
                .catch(reject);
        });
    }
}
