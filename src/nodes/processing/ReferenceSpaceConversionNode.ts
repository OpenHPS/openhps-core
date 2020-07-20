import { DataFrame, ReferenceSpace, DataObject } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { Model } from "../../Model";

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

        this.on('build', this._onRegisterService.bind(this));
    }

    private _onRegisterService(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const service = (this.graph as Model).findDataService(ReferenceSpace);
            console.log(service);
            // Update reference space when modified
            service.on('insert', (space: ReferenceSpace) => {
                console.log("event triggered");
                if (space.uid === this._referenceSpaceUID) {
                    this._referenceSpace = space;
                }
            });

            // Update to the latest version
            service.findByUID(this._referenceSpaceUID).then((space: ReferenceSpace) => {
                console.log("xx");
                this._referenceSpace = space;
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
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
