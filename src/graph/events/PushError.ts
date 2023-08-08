/**
 * Push error
 * @category Graph
 */
export class PushError extends Error {
    /**
     * Frame subject
     */
    frameUID: string;
    /**
     * Node that triggered the error
     */
    nodeUID: string;

    constructor(frameUID: string, nodeUID: string, error: Error) {
        super();
        this.frameUID = frameUID;
        this.nodeUID = nodeUID;
        this.name = error.name;
        this.message = error.message;
        this.stack = error.stack;
    }
}
