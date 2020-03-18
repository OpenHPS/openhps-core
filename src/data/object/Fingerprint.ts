import { SerializableObject, SerializableMember } from "../decorators";
import * as crypto from 'crypto';
import { DataObject } from "./DataObject";

@SerializableObject()
export class Fingerprint extends DataObject {

    constructor() {
        super();
    }

    @SerializableMember()
    public get uid(): string {
        return crypto.createHash('md5').update(JSON.stringify({
            currentLocation: this.currentLocation,
            relativeLocations: this.relativeLocations
        })).digest("hex");
    }
    
    public set uid(uid: string) {
        // No
    }
}
