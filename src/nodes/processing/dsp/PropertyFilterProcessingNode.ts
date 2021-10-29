import { FilterProcessingOptions } from './FilterProcessingNode';
import { DataFrame, DataObject } from '../../../data';
import { ObjectProcessingNode } from '../../ObjectProcessingNode';
import { Vector3 } from '../../../utils';

/**
 * @category Processing node
 */
export abstract class PropertyFilterProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _propertySelector: (object: DataObject, frame?: InOut) => [any, PropertyKey];

    constructor(
        propertySelector: (object: DataObject, frame?: InOut) => [any, PropertyKey],
        options?: FilterProcessingOptions,
    ) {
        super(options);
        this._propertySelector = propertySelector;
    }

    processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Extract all sensor values from the frame
            const [obj, propertyKey] = this._propertySelector(object, frame);
            const property = obj[propertyKey];
            this.filterValue(object, obj, propertyKey, property)
                .then((result: [any, number]) => {
                    result[0][propertyKey] = result[1];
                    resolve(object);
                })
                .catch(reject);
        });
    }

    protected filterValue<T extends number | Vector3>(
        object: DataObject,
        obj: any,
        key: PropertyKey,
        value: T,
    ): Promise<[any, T]> {
        return new Promise((resolve, reject) => {
            // Get existing filter data
            this.getNodeData(object)
                .then(async (nodeData) => {
                    if (nodeData === undefined) {
                        nodeData = {};
                    }
                    if (nodeData[key] === undefined) {
                        nodeData[key] = await this.initFilter(object, value, this.options);
                    }

                    this.filter(object, value, nodeData[key], this.options)
                        .then((value) => resolve([obj, value]))
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
