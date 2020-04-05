import { DataFrame } from "../../data/DataFrame";
import { AsyncEventEmitter } from "../../_internal/AsyncEventEmitter";

export interface AbstractNode<In extends DataFrame | DataFrame[], Out extends DataFrame | DataFrame[]> extends AsyncEventEmitter {
    /**
     * Get unique identifier of node
     */
    uid: string;

    /**
     * Node name
     */
    name: string;
    
    /**
     * Push data to the node
     * 
     * @param frame Data frame to push
     */
    push(frame: In): Promise<void>;

    /**
     * Pull data from the node
     */
    pull(): Promise<void>;

}
