import { Node, GraphPushOptions, Model } from "../../../src";
import { DataFrame, DataObject } from "../../../src/data";

export class DataServiceTestNode extends Node<DataFrame, DataFrame> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(data: DataFrame, options?: GraphPushOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const dataService = (this.graph as Model<any, any>).findDataService(DataObject);
            dataService.findByUID("abc456").then(dataObject => {
                dataObject.displayName = "hello world";
                data.addObject(dataObject);
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(data, options));
                });
                Promise.all(pushPromises).then(_ => {
                    resolve();
                });
            });
        });
    }

}
