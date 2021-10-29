import { DataFrame, DataObject } from '../../../data';
import { ObjectProcessingNode, ObjectProcessingNodeOptions } from '../../ObjectProcessingNode';

/**
 * @category Processing node
 */
export abstract class FilterProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    protected options: FilterProcessingOptions;

    constructor(options?: FilterProcessingOptions) {
        super(options);
    }

    processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Get existing filter data
            this.getNodeData(object)
                .then(async (nodeData) => {
                    if (nodeData === undefined) {
                        nodeData = await this.initFilter(object, frame, this.options);
                    }

                    this.filter(object, frame, nodeData, this.options)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch(reject)
                        .finally(() => {
                            this.setNodeData(object, nodeData)
                                .then(() => {
                                    resolve(undefined);
                                })
                                .catch(reject);
                        });
                })
                .catch(reject);
        });
    }

    abstract initFilter(object: DataObject, frame: InOut, options?: FilterProcessingOptions): Promise<any>;

    abstract filter(
        object: DataObject,
        frame: InOut,
        filter: any,
        options?: FilterProcessingOptions,
    ): Promise<DataObject>;
}

// eslint-disable-next-line
export interface FilterProcessingOptions extends ObjectProcessingNodeOptions {
    
}
