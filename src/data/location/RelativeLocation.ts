import 'reflect-metadata';
import { Location } from "./Location";
import { SerializableObject, SerializableMember } from '../decorators';

/**
 * Relative location to another reference object.
 */
@SerializableObject()
export class RelativeLocation implements Location {
    private _referenceObject: string;

    /**
     * Get the reference object that this location is relative to
     */
    @SerializableMember()
    public get referenceObject(): string {
        return this._referenceObject;
    }

    public set referenceObject(referenceObject: string) {
        this._referenceObject = referenceObject;
    }

}
