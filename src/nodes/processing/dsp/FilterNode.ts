import { DataFrame, DataObject } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";

export abstract class FilterNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _options: FilterOptions;

    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                options?: FilterOptions) {
        super(objectFilter);
        
        this._options = options;
    }

    public processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Get existing filter data
            this.getNodeData(object).then(async nodeData => {
                if (nodeData === undefined) {
                    nodeData = await this.initFilter(object, frame, this._options);
                }
                
                this.filter(object, frame, nodeData, this._options).then(result => {
                    resolve(result);
                }).catch(ex => {
                    reject(ex);
                }).finally(() => {
                    this.setNodeData(object, nodeData).then(() => {
                        resolve();
                    }).catch(ex => {
                        reject(ex);
                    });
                });
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract initFilter(object: DataObject, frame: InOut, options?: FilterOptions): Promise<any>;
    
    public abstract filter(object: DataObject, frame: InOut, filter: any, options?: FilterOptions): Promise<DataObject>;

}
export class FilterOptions {

}
