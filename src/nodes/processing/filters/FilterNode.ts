import { DataFrame } from "../../../data/DataFrame";
import { isNumber } from "util";
import { ProcessingNode } from "../../ProcessingNode";
import { GraphPushOptions } from "../../../graph";
import { DataObject } from "../../../data";

export abstract class FilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _properties: string[];
    private _options: FilterOptions;
    
    constructor(options?: FilterOptions, properties: string[] = null) {
        super();
        this._options = options;
        this._properties = properties;
    }

    public process(frame: InOut, options?: GraphPushOptions): Promise<InOut> {
        return new Promise((resolve, reject) => {
            // Extract all sensor values from the frame
            const filterPromises = new Array();
            const filterProperties = new Array();
            for (const key of Object.getOwnPropertyNames(frame)) {
                // If defined, check if property key is listed
                if (this._properties !== null && this._properties.indexOf(key) === -1) {
                    continue;
                }

                const property = (frame as any)[key];
                if (isNumber(property)) {
                    // 1D sensor value
                    filterProperties.push({ key });
                    filterPromises.push(this._filterValue(frame.source, `${key}`, property));
                } else if (property instanceof Array) {
                    // ND sensor value
                    for (let i = 0 ; i < property.length ; i++) {
                        if (isNumber(property[i])) {
                            filterProperties.push({ key, index: i });
                            filterPromises.push(this._filterValue(frame.source, `${key}_${i}`, property[i]));
                        }
                    }
                }
            }

            Promise.all(filterPromises).then((values: number[]) => {
                for (let i = 0 ; i < values.length ; i++) {
                    const propertyDetails = filterProperties[i];
                    if (propertyDetails.index === undefined) {
                        (frame as any)[propertyDetails.key] = values[i];
                    } else {
                        (frame as any)[propertyDetails.key][propertyDetails.index] = values[i];
                    }
                }
                resolve(frame);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _filterValue(source: DataObject, key: string, value: number): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            // Get existing filter
            let nodeData = source.getNodeData(this.uid);
            if (nodeData === undefined) {
                nodeData = {};
            }
            if (nodeData[key] === undefined) {
                nodeData[key] = await this.initFilter(value, this._options);
            }

            this.filter(value, nodeData[key], this._options).then(result => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            }).finally(() => {
                source.setNodeData(this.uid, nodeData);
            });
        });
    }

    public abstract initFilter(value: number, options: FilterOptions): Promise<any>;
    
    public abstract filter(value: number, filter: any, options?: FilterOptions): Promise<number>;

}
export class FilterOptions {

}
