import { DataFrame, DataObject, Node } from "../../../src";

export class ErrorThrowingNode extends Node<DataFrame, DataFrame> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(frame: DataFrame): Promise<void> {
        return new Promise((resolve, reject) => {
            reject(new Error(`This is deliberate!`));
        });
    }

}
