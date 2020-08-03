import { DataFrame, ReferenceSpace, DataObject } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { Model } from "../../Model";
import { DataObjectService } from "../../service";

/**
 * This node converts the positions of data objects inside the frame
 * to another reference space 
 */
export class ReferenceSpaceConversionNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _referenceSpaceUID: string;
    private _referenceSpace: ReferenceSpace;
    private _inverse: boolean = false;

    constructor(referenceSpace: ReferenceSpace | string, inverse: boolean = false) {
        super();
        if (referenceSpace instanceof ReferenceSpace) {
            this._referenceSpace = referenceSpace;
            this._referenceSpaceUID = referenceSpace.uid;
        } else {
            this._referenceSpaceUID = referenceSpace;
        }
        this._inverse = inverse;

        this.once('build', this._onRegisterService.bind(this));
    }

    private _onRegisterService(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const service = (this.graph as Model).findDataService<ReferenceSpace>(ReferenceSpace);
            // Update reference space when modified
            service.on('insert', (space: ReferenceSpace) => {
                if (space.uid === this._referenceSpaceUID) {
                    this._referenceSpace = space;
                }
            });

            // Update to the latest version
            service.findByUID(this._referenceSpaceUID).then((space: ReferenceSpace) => {
                this._referenceSpace = space;
                resolve();
            }).catch(ex => {
                // Ignore, most likely not calibrated or stored yet
                resolve();
            });
        });
    }

    public processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            // First check if a reference space is provided inside
            // the data frame. If not, use the stored reference space
            let referenceSpace = frame.getObjectByUID(this._referenceSpaceUID) as ReferenceSpace;
            if (referenceSpace === null || referenceSpace === undefined) {
                referenceSpace = this._referenceSpace;
            }

            if (object.getPosition() && object.uid !== referenceSpace.uid) {
                if (this._inverse) {
                    // Convert from reference space to global
                    object.setPosition(object.getPosition(), referenceSpace);
                } else {
                    // Convert global space to reference space
                    object.setPosition(object.getPosition(referenceSpace));
                }
            }
            resolve(object);
        });
    }

}
