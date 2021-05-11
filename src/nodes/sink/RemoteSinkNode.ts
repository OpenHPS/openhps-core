import { RemoteNode, RemoteNodeOptions } from '../RemoteNode';
import { DataFrame } from '../../data';
import { SinkNode, SinkNodeOptions } from '../SinkNode';

import { RemoteNodeService } from '../../service/RemoteNodeService';
import { ModelBuilder } from '../../ModelBuilder';
import { Edge } from '../../graph/Edge';
import { PushOptions } from '../../graph/options/PushOptions';

export class RemoteSinkNode<In extends DataFrame, S extends RemoteNodeService> extends SinkNode<In> {
    private _remoteNode: RemoteNode<In, In, S>;

    constructor(options?: SinkNodeOptions & RemoteNodeOptions) {
        super(options);
        this._remoteNode = new RemoteNode<In, In, S>(options);

        this.once('build', this._onRemoteBuild.bind(this));
        this.once('destroy', this._onRemoteDestroy.bind(this));
    }

    private _onRemoteBuild(graphBuilder: ModelBuilder<any, any>): Promise<boolean> {
        this._remoteNode.graph = this.graph;
        this._remoteNode.logger = this.logger;
        graphBuilder.addNode(this._remoteNode);
        graphBuilder.addEdge(new Edge(this._remoteNode, this));
        graphBuilder.addEdge(new Edge(this, this._remoteNode));
        return this._remoteNode.emitAsync('build', graphBuilder);
    }

    private _onRemoteDestroy(): Promise<boolean> {
        return this._remoteNode.emitAsync('destroy');
    }

    public onPush(data: In | In[], options?: PushOptions): Promise<void> {
        return this._remoteNode.push(data, options);
    }
}
