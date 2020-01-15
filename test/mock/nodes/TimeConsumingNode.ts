import { Node, GraphPushOptions } from "../../../src";
import { DataFrame } from "../../../src/data";

export class TimeConsumingNode extends Node<DataFrame, DataFrame> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(data: DataFrame, options?: GraphPushOptions): void {
        setTimeout(() => {
            this.getOutputNodes().forEach(node => {
                node.push(data, options);
            });
        }, 10);
    }

}
