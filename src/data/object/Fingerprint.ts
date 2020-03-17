import { SerializableObject } from "../decorators";
import * as crypto from 'crypto';
import { DataObject } from "./DataObject";
import { DataSerializer } from "../DataSerializer";
import { RelativeLocation } from "../location/RelativeLocation";

@SerializableObject()
export class Fingerprint extends DataObject {

    constructor(relativeLocation?: RelativeLocation) {
        super();
        if (relativeLocation !== undefined) {
            this.addRelativeLocation(relativeLocation);
        }
        this.uid = crypto.createHash('md5').update(DataSerializer.serialize(this)).digest("hex");
    }
    
}
