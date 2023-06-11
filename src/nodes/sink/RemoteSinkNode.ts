import { RemoteNode, RemoteNodeOptions } from '../RemoteNode';
import { DataFrame } from '../../data';
import { SinkNode, SinkNodeOptions } from '../SinkNode';

import { RemoteService } from '../../service/RemoteService';
import { ModelBuilder } from '../../ModelBuilder';
import { Edge } from '../../graph/Edge';
import { PushOptions } from '../../graph/options/PushOptions';
import { Constructor } from '../../data/decorators';

/**
 * Remote sink node
 */
export class RemoteSinkNode<
    In extends DataFrame,
    S extends RemoteService,
    N extends RemoteNode<In, In, S> = RemoteNode<In, In, S>,
> extends SinkNode<In> {
    protected remoteNode: N;

    constructor(options?: RemoteSinkNodeOptions<S>) {
        super(options);
        this.remoteNode = new (options.type ?? RemoteNode)(options, this) as N;
        this.uid = `${this.uid}-sink`;

        this.once('build', this._onRemoteBuild.bind(this));
        this.once('destroy', this._onRemoteDestroy.bind(this));
    }

    private _onRemoteBuild(graphBuilder: ModelBuilder<any, any>): Promise<boolean> {
        this.remoteNode.graph = this.graph;
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

export interface RemoteSinkNodeOptions<S extends RemoteService> extends SinkNodeOptions, RemoteNodeOptions<S> {
    /**
     * Node type to use
     *
     * @default RemoteNode a normal remote node
     */
    type?: Constructor<RemoteNode<any, any, S>>;
}
