export class PushEvent {
    /**
     * Frame subject
     */
    frameUID: string;

    constructor(frameUID: string) {
        this.frameUID = frameUID;
    }
}
