import { FilterProcessingOptions } from './FilterProcessingNode';
import { DataFrame, DataObject } from '../../../data';
import { ObjectProcessingNode } from '../../ObjectProcessingNode';
import { Vector3 } from '../../../utils';
import { TimeService } from '../../../service/TimeService';

export type PropertyType = { key: string; value: number | Vector3 };
export type PropertySelector<T> = (object: DataObject, frame?: T) => Array<PropertyType>;
export type PropertyModifier<T> = (key: string, value: number | Vector3, object: DataObject, frame?: T) => void;

/**
 * @category Processing node
 */
export abstract class PropertyFilterProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _propertySelector: PropertySelector<InOut>;
    private _propertyModifier: PropertyModifier<InOut>;
    protected options: FilterProcessingOptions;

    constructor(
        propertySelector: PropertySelector<InOut>,
        propertyModifier: PropertyModifier<InOut>,
        options?: FilterProcessingOptions,
    ) {
        super(options);
        this._propertySelector = propertySelector;
        this._propertyModifier = propertyModifier;
    }

    processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Extract all sensor values from the frame
            const types = this._propertySelector(object, frame);
            Promise.all(
                types.map((type) => {
                    return this.filterValue(object, type.value, type.key);
                }),
            )
                .then((results: Array<number | Vector3>) => {
                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
                        const type = types[i];
                        this._propertyModifier(type.key, result, object, frame);
                    }
                    resolve(object);
                })
                .catch(reject);
        });
    }

    protected filterValue<T extends number | Vector3>(object: DataObject, value: T, key = 'default'): Promise<T> {
        return new Promise((resolve, reject) => {
            // Get existing filter data
            this.getNodeData(object)
                .then(async (nodeData) => {
                    if (nodeData === undefined) {
                        nodeData = {};
                    }

                    const currentTimestamp = TimeService.now();
                    if (nodeData[key] === undefined) {
                        nodeData[key] = {
                            timestamp: currentTimestamp,
                            ...(await this.initFilter(object, value, this.options)),
                        };
                    }

                    if (this.options.expire) {
                        const deleteData = [];
                        Object.keys(nodeData).forEach((key) => {
                            const data = nodeData[key];
                            if (data['timestamp']) {
                                if (data.timestamp + this.options.expire < currentTimestamp) {
                                    deleteData.push(key);
                                }
                            }
                        });
                        deleteData.forEach((key) => {
                            delete nodeData[key];
                        });
                    }

                    this.filter(object, value, nodeData[key], this.options)
                        .then(resolve)
                        .catch(reject)
                        .finally(() => {
                            this.setNodeData(object, nodeData);
                        });
                })
                .catch(reject);
        });
    }

    abstract initFilter<T extends number | Vector3>(
        object: DataObject,
        value: T,
        options: FilterProcessingOptions,
    ): Promise<any>;

    abstract filter<T extends number | Vector3>(
        object: DataObject,
        value: T,
        filter: any,
        options?: FilterProcessingOptions,
    ): Promise<T>;
}
