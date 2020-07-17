import { DataFrame, ReferenceSpace, DataObject } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";

/**
 * This node converts the positions of data objects inside the frame
 * to another reference space 
 */
export class ReferenceSpaceConversionNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _referenceSpace: ReferenceSpace;
    private _inverse: boolean = false;

    constructor(referenceSpace: ReferenceSpace, inverse: boolean) {
        super();
        this._referenceSpace = referenceSpace;
        this._inverse = inverse;
    }

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (object.getCurrentPosition()) {
                if (this._inverse) {
                    // Convert from reference space to global
                    object.setCurrentPosition(object.getCurrentPosition(), this._referenceSpace);
                } else {
                    // Convert global space to reference space
                    object.setCurrentPosition(object.getCurrentPosition(this._referenceSpace));
                }
            }
            resolve(object);
        });
    }

}
