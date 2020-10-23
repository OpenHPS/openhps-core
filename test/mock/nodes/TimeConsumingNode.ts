import { DataFrame, DataObject, Node } from "../../../src";

export class TimeConsumingNode extends Node<DataFrame, DataFrame> {
    private _timeout: number;

    constructor(timeout: number = 10) {
        super();
        this._timeout = timeout;
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
                Promise.all(pushPromises).then(() => {
                    resolve();
                });
            }, this._timeout);
        });
    }

}
