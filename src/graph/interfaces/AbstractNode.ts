import { DataFrame } from "../../data/DataFrame";

export interface AbstractNode<In extends DataFrame | DataFrame[], Out extends DataFrame | DataFrame[]> {
    /**
     * Get unique identifier of node
     */
    uid: string;

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

    on(event: string, callback: () => any): void;

}
