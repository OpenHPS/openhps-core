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
    private _referenceValue: number;

    constructor(referenceObject?: any, referenceValue?: number) {
        if (referenceObject !== undefined) {
            this.referenceObjectType = referenceObject.constructor.name;
            this.referenceObjectUID = referenceObject.uid;
        }
        this.referenceValue = referenceValue;
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
    public get referenceValue(): number {
        return this._referenceValue;
    }

    public set referenceValue(value: number) {
        this._referenceValue = value;
    }

    @SerializableMember()
    public get referenceObjectType(): string {
        return this._referenceObjectType;
    }

    public set referenceObjectType(referenceObjectType: string) {
        this._referenceObjectType = referenceObjectType;
    }
}
