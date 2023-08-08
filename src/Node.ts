import { DataFrame } from './data/DataFrame';
import { Model } from './Model';
import { GraphNode } from './graph/_internal/GraphNode';
import { SerializableMember, SerializableObject } from './data';

/**
 * The graph node has an input and output {@link DataFrame}
 *
 * ## Usage
 *
 * ### Creating a Node
 * Default nodes require you to specify the input and output data frame type. In general, nodes have the ability
 * to process an input data frame and output a different (processed) data frame.
 * ```typescript
 * import { DataFrame, Node } from '@openhps/core';
 *
 * export class CustomNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {
 * // ...
 * }
 * ```
 * Abstract implementations such as a {@link SourceNode} and {@link SinkNode} only take one input or output
 * data frame type as they do not process or change the frame.
 * @category Node
 */
@SerializableObject()
export class Node<In extends DataFrame, Out extends DataFrame> extends GraphNode<In, Out> {
    /**
     * Node options
     */
    @SerializableMember()
    protected options: NodeOptions;

    constructor(options?: NodeOptions) {
        super();
        this.setOptions(options || {});

        // Set the uid of the node if manually set
        this.uid = this.options.uid || this.uid;
    }

    /**
     * Set the node options
     * @param {NodeOptions} options Node options to set
     * @returns {Node} Node instance
     */
    setOptions(options: NodeOptions): this {
        this.options = {
            ...options,
            ...(this.options || []),
        };
        // Set the display name of the node to the type name
        this.name = this.options.name || this.constructor.name;
        return this;
    }

    /**
     * Get the node options
     * @returns {NodeOptions} Node options
     */
    getOptions(): NodeOptions {
        return this.options;
    }

    /**
     * Graph this model is part of
     * @returns {Model} Positioning model
     */
    get model(): Model<any, any> {
        return this.graph as Model;
    }
}

export interface NodeOptions {
    /**
     * Manually set the unique identifier of the node
     */
    uid?: string;
    /**
     * User friendly name of the node
     *  Used for querying a node by its name.
     */
    name?: string;
}
