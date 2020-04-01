import { Node, Model } from "../../../src";
import { DataFrame, DataObject } from "../../../src/data";

export class DataServiceTestNode extends Node<DataFrame, DataFrame> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(frame: DataFrame): Promise<void> {
        return new Promise((resolve, reject) => {
            const dataService = (this.graph as Model<any, any>).findDataService(DataObject);
            dataService.findByUID("abc456").then(dataObject => {
                dataObject.displayName = "hello world";
                frame.addObject(dataObject);
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(frame));
                });
                Promise.all(pushPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            });
        });
    }

}
