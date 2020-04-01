import { Node } from "../../../src";
import { DataFrame, DataObject } from "../../../src/data";

export class TimeConsumingNode extends Node<DataFrame, DataFrame> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(frame: DataFrame): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                frame.addObject(new DataObject("time object"));
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(frame));
                });
                Promise.all(pushPromises).then(_ => {
                    resolve();
                });
            }, 10);
        });
    }

}
