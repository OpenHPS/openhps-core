import { Node, GraphPushOptions } from "../../../src";
import { DataFrame, DataObject } from "../../../src/data";

export class TimeConsumingNode extends Node<DataFrame, DataFrame> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(data: DataFrame, options?: GraphPushOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                data.addObject(new DataObject("time object"));
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(data, options));
                });
                Promise.all(pushPromises).then(_ => {
                    resolve();
                });
            }, 10);
        });
    }

}
