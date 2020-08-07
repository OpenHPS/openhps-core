import { FilterOptions } from "./FilterNode";
import { DataFrame, DataObject } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Vector3 } from "../../../utils";

export abstract class PropertyFilterNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _propertySelector: (object: DataObject, frame?: InOut) =>  PropertyKey;
    private _options: FilterOptions;

    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey, 
                options?: FilterOptions) {
        super(objectFilter);

        this._options = options;
        this._propertySelector = propertySelector;
    }

    
    public processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise(async (resolve, reject) => {
            // Extract all sensor values from the frame
            const propertyKey = this._propertySelector(object, frame);
            const property = (object as any)[propertyKey];
            Promise.resolve(this._filterValue(object, propertyKey, property)).then((value: number) => {
                (object as any)[propertyKey] = value;
                resolve(object);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _filterValue<T extends number | Vector3>(object: DataObject, key: PropertyKey, value: T): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            // Get existing filter data
            this.getNodeData(object).then(async nodeData => {
                if (nodeData === undefined) {
                    nodeData = {};
                }
                if (nodeData[key] === undefined) {
                    nodeData[key] = await this.initFilter(object, value, this._options);
                }

                this.filter(object, value, nodeData[key], this._options).then(result => {
                    resolve(result);
                }).catch(ex => {
                    reject(ex);
                }).finally(() => {
                    this.setNodeData(object, nodeData);
                });
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract initFilter<T extends number | Vector3>(object: DataObject, value: T, options: FilterOptions): Promise<any>;
    
    public abstract filter<T extends number | Vector3>(object: DataObject, value: T, filter: any, options?: FilterOptions): Promise<T>;

}
