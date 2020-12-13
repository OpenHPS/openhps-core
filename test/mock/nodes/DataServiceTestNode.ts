import { DataFrame, DataObject, Node, Model } from "../../../src";

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
                this.outlets.forEach(outlet => outlet.push(frame));
                resolve();
            });
        });
    }

}
