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

    public processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Extract all sensor values from the frame
            const [obj, propertyKey] = this._propertySelector(object, frame);
            const property = obj[propertyKey];
            this._filterValue(object, propertyKey, property)
                .then((value: number) => {
                    obj[propertyKey] = value;
                    resolve(object);
                })
                .catch(reject);
        });
    }

    private _filterValue<T extends number | Vector3>(object: DataObject, key: PropertyKey, value: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
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
                        .then(resolve)
                        .catch(reject)
                        .finally(() => {
                            this.setNodeData(object, nodeData);
                        });
                })
                .catch(reject);
        });
    }

    public abstract initFilter<T extends number | Vector3>(
        object: DataObject,
        value: T,
        options: FilterProcessingOptions,
    ): Promise<any>;

    public abstract filter<T extends number | Vector3>(
        object: DataObject,
        value: T,
        filter: any,
        options?: FilterProcessingOptions,
    ): Promise<T>;
}
