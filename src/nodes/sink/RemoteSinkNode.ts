import { RemoteNode, RemoteNodeOptions } from '../RemoteNode';
import { DataFrame } from '../../data';
import { SinkNode, SinkNodeOptions } from '../SinkNode';

import { RemoteNodeService } from '../../service/RemoteNodeService';
import { ModelBuilder } from '../../ModelBuilder';
import { Edge } from '../../graph/Edge';
import { PushOptions } from '../../graph/options/PushOptions';

/**
 * Remote sink node
 */
export class RemoteSinkNode<In extends DataFrame, S extends RemoteNodeService> extends SinkNode<In> {
    protected remoteNode: RemoteNode<In, In, S>;

    constructor(options?: SinkNodeOptions & RemoteNodeOptions) {
        super(options);
        this.remoteNode = new RemoteNode<In, In, S>(options);
        this.uid = `${this.uid}-sink`;

        this.once('build', this._onRemoteBuild.bind(this));
        this.once('destroy', this._onRemoteDestroy.bind(this));
    }

    private _onRemoteBuild(graphBuilder: ModelBuilder<any, any>): Promise<boolean> {
        this.remoteNode.graph = this.graph;
        this.remoteNode.logger = this.logger;
        graphBuilder.addNode(this.remoteNode);
        graphBuilder.addEdge(new Edge(this, this.remoteNode));
        return this.remoteNode.emitAsync('build', graphBuilder);
    }

    private _onRemoteDestroy(): Promise<boolean> {
        return this.remoteNode.emitAsync('destroy');
    }

    public onPush(data: In | In[], options?: PushOptions): Promise<void> {
        // Force push to remote node, sink nodes do not push by default
        return this.remoteNode.push(data, options);
    }
}
