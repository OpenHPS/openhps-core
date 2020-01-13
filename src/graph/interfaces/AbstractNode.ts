import { DataFrame } from "../../data/DataFrame";
import { GraphPushOptions } from "../../graph/GraphPushOptions";
import { GraphPullOptions } from "../../graph/GraphPullOptions";

export interface AbstractNode<In extends DataFrame, Out extends DataFrame> {
    /**
     * Get unique identifier of node
     */
    getUID(): string;

    getName(): string;

    setName(name: string): void;
    
    /**
     * Push data to the node
     * 
     * @param data Data to push
     * @param options Push options
     */
    push(data: In, options?: GraphPushOptions): Promise<void>;

    /**
     * Pull data from the node
     * 
     * @param options Pull options
     */
    pull(options?: GraphPullOptions): Promise<void>;

    on(event: string, callback: () => any): void;
    
    serialize(): Object;

}
