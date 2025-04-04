import { DataFrame, DataObject, RelativePosition } from '../../data';
import { ObjectProcessingNode, ObjectProcessingNodeOptions } from '../ObjectProcessingNode';

/**
 * Relative position processing node.
 * @category Processing node
 */
export abstract class RelativePositionProcessing<
    InOut extends DataFrame,
    R extends RelativePosition,
> extends ObjectProcessingNode<InOut> {
    private _relativePositionType: new () => R;

    constructor(relativePositionType: new () => R, options?: ObjectProcessingNodeOptions) {
        super(options);
        this._relativePositionType = relativePositionType;
    }

    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const referencePromises: Array<Promise<DataObject>> = [];
            const index = new Map<string, R>();
            for (const relativePosition of dataObject.relativePositions) {
                // Only use relative positions that are instance of relativePositionType
                if (relativePosition instanceof this._relativePositionType) {
                    index.set(relativePosition.referenceObjectUID, relativePosition);
                    referencePromises.push(
                        this.findObjectByUID(
                            relativePosition.referenceObjectUID,
                            dataFrame,
                            relativePosition.referenceObjectType,
                        ),
                    );
                }
            }

            Promise.all(referencePromises)
                .then((referenceObjects) => {
                    const relativePositions: Map<R, DataObject> = new Map();
                    referenceObjects
                        .filter((obj) => obj !== undefined)
                        .forEach((referenceObject: DataObject) => {
                            relativePositions.set(index.get(referenceObject.uid), referenceObject);
                        });
                    return this.processRelativePositions(dataObject, relativePositions, dataFrame);
                })
                .then((modifiedObject) => {
                    resolve(modifiedObject);
                })
                .catch(reject);
        });
    }

    public abstract processRelativePositions(
        dataObject: DataObject,
        relativePositions: Map<R, DataObject>,
        dataFrame?: InOut,
    ): Promise<DataObject>;
}
