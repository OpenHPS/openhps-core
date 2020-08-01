import { DataFrame, DataObject, RelativePosition } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";

export abstract class RelativePositionProcessing<InOut extends DataFrame, R extends RelativePosition> extends ObjectProcessingNode<InOut> {
    private _relativePositionType: new () => R;

    constructor(relativePositionType: new () => R, filterFn?: (object: DataObject, frame?: InOut) => boolean) {
        super(filterFn);
        this._relativePositionType = relativePositionType;
    }

    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const referencePromises = new Array();
            const index = new Map<string, R[]>();
            for (const relativePosition of dataObject.relativePositions) {
                // Only use relative distance locations
                if (relativePosition instanceof this._relativePositionType) {
                    if (index.has(relativePosition.referenceObjectUID)) {
                        index.get(relativePosition.referenceObjectUID).push(relativePosition);
                    } else {
                        index.set(relativePosition.referenceObjectUID, [relativePosition]);
                    }
                    referencePromises.push(this.findObjectByUID(relativePosition.referenceObjectUID, dataFrame, relativePosition.referenceObjectType));
                }
            }

            Promise.all(referencePromises).then(referenceObjects => {
                const relativePositions: Map<R, DataObject> = new Map();
                referenceObjects.forEach((referenceObject: DataObject) => {
                    index.get(referenceObject.uid).forEach(relativePosition => {
                        relativePositions.set(relativePosition, referenceObject);
                    });
                });

                return this.processRelativePositions(dataObject, relativePositions, dataFrame);
            }).then(modifiedObject => {
                resolve(modifiedObject);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract processRelativePositions(dataObject: DataObject, relativePositions: Map<R, DataObject>, dataFrame?: InOut): Promise<DataObject>;

}
