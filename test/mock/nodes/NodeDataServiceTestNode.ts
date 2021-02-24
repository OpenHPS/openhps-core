import { DataFrame, DataObject, Node, Model, NodeData, NodeDataService } from "../../../src";

export class NodeDataServiceTestNode extends Node<DataFrame, DataFrame> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(frame: DataFrame): Promise<void> {
        return new Promise((resolve, reject) => {
            const dataService: NodeDataService<NodeData> = (this.graph as Model<any, any>).findDataService(NodeData);
            dataService.insertData("x123", frame.source, { test: "abc" }).then(() => {
                this.outlets.forEach(outlet => outlet.push(frame));
                resolve();
            }).catch(reject);
        });
    }

}
