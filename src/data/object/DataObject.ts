import { AbsolutePosition } from "../position/AbsolutePosition";
import { RelativePosition } from '../position/RelativePosition';
import { TypedJSON } from 'typedjson';
import { SerializableObject, SerializableMember, SerializableArrayMember } from '../decorators';
import { v4 as uuidv4 } from 'uuid';
import { DataSerializer } from '../DataSerializer';
import { Space } from "./space/Space";

/**
 * A data object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or [[Space]].
 */
@SerializableObject()
export class DataObject {
    private _uid: string;
    private _displayName: string;
    private _position: AbsolutePosition;
    private _relativePositions: Map<string, Map<string, RelativePosition>> = new Map();
    private _parentUID: string;
    @SerializableMember()
    public createdTimestamp: number;

    /**
     * Create a new data object
     * 
     * @param uid Optional unique identifier
     * @param displayName Optional display name
     */
    constructor(uid: string = uuidv4(), displayName?: string) {
        this.uid = uid;
        this.createdTimestamp = new Date().getTime();
        this.displayName = displayName;
    }

    public merge(object: DataObject): DataObject {
        if (this.displayName === undefined)
            this.displayName = object.displayName;
        if (this.getPosition() === undefined && object.getPosition() !== undefined)
            this.setPosition(object.getPosition().clone());
        object._relativePositions.forEach((value: Map<string, RelativePosition>, key: string) => {
            const newRelativePositions = this._relativePositions.get(key);
            if (newRelativePositions === undefined) {
                this._relativePositions.set(key, value);
            } else {
                value.forEach((existingRelativePosition: RelativePosition) => {
                    const newRelativePosition = newRelativePositions.get(existingRelativePosition.constructor.name);
                    if (!newRelativePosition) {
                        this.addRelativePosition(existingRelativePosition);
                    } else {
                        // Check timestamp. If existing one is newer, override
                        if (existingRelativePosition.timestamp > newRelativePosition.timestamp) {
                            this.addRelativePosition(existingRelativePosition);
                        }
                    }
                });
            }
        });
        return this;
    }
    
    /**
     * Get the object identifier
     */
    @SerializableMember()
    public get uid(): string {
        return this._uid;
    }

    /**
     * Set the object identifier
     * @param uid Object identifier
     */
    public set uid(uid: string) {
        this._uid = uid;
    }
        
    /**
     * Get the parent object identifier
     */
    @SerializableMember()
    public get parentUID(): string {
        return this._parentUID;
    }

    /**
     * Set the parent object identifier
     * @param uid Parent object identifier
     */
    public set parentUID(uid: string) {
        this._parentUID = uid;
    }

    /**
     * Get the object display name
     */
    @SerializableMember()
    public get displayName(): string {
        return this._displayName;
    }

    /**
     * Set the display name of the object
     * @param displayName Object display name
     */
    public set displayName(displayName: string) {
        this._displayName = displayName;
    }

    /**
     * Get the current absolute position of the object
     * relative to the global reference space
     */
    @SerializableMember({
        deserializer(raw: any): AbsolutePosition {
            if (raw === undefined) {
                return undefined;
            }
            return new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw);
        }
    })
    public get position(): AbsolutePosition {
        return this.getPosition();
    }

    /**
     * Set the current absolute position of the object
     * relative to the global reference space
     */
    public set position(position: AbsolutePosition) {
        this.setPosition(position);
    }

    /**
     * Get the current absolute position of the object
     * @param referenceSpace (optional) reference space
     */
    public getPosition(referenceSpace?: Space): AbsolutePosition {
        if (referenceSpace !== undefined && this._position !== undefined) {
            return referenceSpace.transform(this._position, true);
        } else {
            return this._position;
        }
    }

    /**
     * Set the current absolute position of the object
     * @param position Position to set
     * @param referenceSpace (optional) reference space
     */
    public setPosition(position: AbsolutePosition, referenceSpace?: Space) {
        this._position = referenceSpace ? referenceSpace.transform(position, false) : position;
    }

    /**
     * Get relative positions
     */
    @SerializableArrayMember(Object, {
        deserializer(rawArray: any[]): RelativePosition[] {
            if (rawArray === undefined) {
                return [];
            }
            const output = new Array();
            rawArray.forEach(raw => {
                if (raw.__type !== undefined) {
                    output.push(new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw));
                }
            });
            return output;
        }
    })
    public get relativePositions(): RelativePosition[] {
        const relativePostions: RelativePosition[] = new Array();
        if (this._relativePositions !== undefined) {
            this._relativePositions.forEach((values: Map<string, RelativePosition>) => {
                values.forEach(value => { relativePostions.push(value); });
            });
        }
        return relativePostions;
    }

    public set relativePositions(relativePostions: RelativePosition[]) {
        this._relativePositions = new Map();
        relativePostions.forEach(relativePostion => {
            this.addRelativePosition(relativePostion);
        });
    }

    public removeRelativePositions(referenceObjectUID: string): void {
        this._relativePositions.delete(referenceObjectUID);
    }

    /**
     * Add a relative position to this data object
     * @param relativePosition 
     */
    public addRelativePosition(relativePosition: RelativePosition): void {
        if (relativePosition.referenceObjectUID === undefined) {
            return;
        }

        if (!this._relativePositions.has(relativePosition.referenceObjectUID)) {
            this._relativePositions.set(relativePosition.referenceObjectUID, new Map());
        }

        this._relativePositions.get(relativePosition.referenceObjectUID).set(relativePosition.constructor.name, relativePosition);
    }

    /**
     * Get relative positions for a different target
     */
    public getRelativePositions(referenceObjectUID?: string): RelativePosition[] {
        if (referenceObjectUID === undefined) {
            return this.relativePositions;
        } else if (this._relativePositions.has(referenceObjectUID)) {
            return Array.from(this._relativePositions.get(referenceObjectUID).values());
        } else {
            return undefined;
        }
    }

    public getRelativePosition(referenceObjectUID: string): RelativePosition {
        if (this._relativePositions.has(referenceObjectUID)) {
            return Array.from(this._relativePositions.get(referenceObjectUID).values())[0];
        } else {
            return undefined;
        }
    }

}
