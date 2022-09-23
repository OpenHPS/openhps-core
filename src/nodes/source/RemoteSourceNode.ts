import { RemoteNode, RemoteNodeOptions } from '../RemoteNode';
import { DataFrame } from '../../data/DataFrame';
import { Edge } from '../../graph/Edge';
import { ModelBuilder } from '../../ModelBuilder';
import { RemoteService } from '../../service/RemoteService';
import { SourceNode, SourceNodeOptions } from '../SourceNode';
import { PushCompletedEvent, PushError } from '../../graph/events';
import { Constructor } from '../../data/decorators';

/**
 * Remote source node
 */
export class RemoteSourceNode<
    Out extends DataFrame,
    S extends RemoteService,
    N extends RemoteNode<Out, Out, S> = RemoteNode<Out, Out, S>,
> extends SourceNode<Out> {
    protected remoteNode: N;

    constructor(options?: RemoteSourceNodeOptions<S>) {
        super(options);
        this.remoteNode = new (options.type ?? RemoteNode)(options, this) as N;
        this.uid = `${this.uid}-source`;

        this.once('build', this._onRemoteBuild.bind(this));
        this.on('error', this._onDownstreamError.bind(this));
        this.on('completed', this._onDownstreamCompleted.bind(this));
    }

    private _onRemoteBuild(graphBuilder: ModelBuilder<any, any>): Promise<boolean> {
        // Add a remote node before this node
        this.remoteNode.graph = this.graph;
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

    private _onDownstreamError(error: PushError): void {
        this.remoteNode.emit('error', error);
    }

    private _onDownstreamCompleted(event: PushCompletedEvent): void {
        this.remoteNode.emit('completed', event);
    }
}

export interface RemoteSourceNodeOptions<S extends RemoteService> extends SourceNodeOptions, RemoteNodeOptions<S> {
    /**
     * Node type to use
     *
     * @default RemoteNode a normal remote node
     */
    type?: Constructor<RemoteNode<any, any, S>>;
}
