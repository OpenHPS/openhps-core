import 'reflect-metadata';
import { Location } from "./Location";
import { SerializableObject, SerializableMember } from '../decorators';

/**
 * Relative location to another reference object.
 */
@SerializableObject()
export class RelativeLocation implements Location {
    private _referenceObjectUID: string;
    private _referenceObjectType: string;

    constructor(referenceObjectUID?: string, referenceObjectType?: string) {
        this.referenceObjectType = referenceObjectType;
        this.referenceObjectUID = referenceObjectUID;
    }

    /**
     * Get the reference object UID that this location is relative to
     */
    @SerializableMember()
    public get referenceObjectUID(): string {
        return this._referenceObjectUID;
    }

    public set referenceObjectUID(referenceObjectUID: string) {
        this._referenceObjectUID = referenceObjectUID;
    }

    @SerializableMember()
    public get referenceObjectType(): string {
        return this._referenceObjectType;
    }

    public set referenceObjectType(referenceObjectType: string) {
        this._referenceObjectType = referenceObjectType;
    }
}
