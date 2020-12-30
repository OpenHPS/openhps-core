import { AbsolutePosition } from '../position/AbsolutePosition';
import { RelativePosition } from '../position/RelativePosition';
import { TypedJSON } from 'typedjson';
import { SerializableObject, SerializableMember, SerializableArrayMember } from '../decorators';
import { v4 as uuidv4 } from 'uuid';
import { DataSerializer } from '../DataSerializer';
import { TimeService } from '../../service';
import { ReferenceSpace } from './space';

/**
 * A data object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or [[Space]].
 *
 * ## Usage
 *
 * ### Creation
 * Objects can be created with an optional uid and display name.
 * ```typescript
 * const myObject = new DataObject("mvdewync", "Maxim");
 * ```
 */
@SerializableObject()
export class DataObject {
    /**
     * Object display name
     */
    @SerializableMember()
    public displayName: string;
    /**
     * Parent object identifier
     */
    @SerializableMember()
    public parentUID: string;
    @SerializableMember()
    public createdTimestamp: number;

    private _uid: string;
    private _position: AbsolutePosition;
    private _relativePositions: Map<string, Map<string, RelativePosition<any>>> = new Map();

    /**
     * Create a new data object
     *
     * @param {string} uid Optional unique identifier
     * @param {string} displayName Optional display name
     */
    constructor(uid: string = uuidv4(), displayName?: string) {
        this.uid = uid;
        this.createdTimestamp = TimeService.now();
        this.displayName = displayName;
    }

    /**
     * Object identifier
     *
     * @returns {string} Unique object identifier
     */
    @SerializableMember()
    public get uid(): string {
        return this._uid;
    }

    public set uid(value: string) {
        this._uid = value;
    }

    /**
     * Get the current absolute position of the object
     * relative to the global reference space
     *
     * @returns {AbsolutePosition} Absolute position of data object
     */
    @SerializableMember({
        deserializer(raw: any): AbsolutePosition {
            if (raw === undefined) {
                return undefined;
            }
            return new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw);
        },
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
     *
     * @param {ReferenceSpace} [referenceSpace] Reference space
     * @returns {AbsolutePosition} Position of the data object
     */
    public getPosition(referenceSpace?: ReferenceSpace): AbsolutePosition {
        if (referenceSpace !== undefined && this._position !== undefined) {
            return referenceSpace.transform(this._position, {
                inverse: true,
            });
        } else {
            return this._position;
        }
    }

    /**
     * Set the current absolute position of the object
     *
     * @param {AbsolutePosition} position Position to set
     * @param {ReferenceSpace} [referenceSpace] Reference space
     */
    public setPosition(position: AbsolutePosition, referenceSpace?: ReferenceSpace): void {
        this._position = referenceSpace
            ? referenceSpace.transform(position, {
                  inverse: false,
              })
            : position;
    }

    /**
     * Get relative positions
     *
     * @returns {RelativePosition[]} Array of relative positions
     */
    @SerializableArrayMember(Object, {
        deserializer(rawArray: any[]): RelativePosition<any>[] {
            if (rawArray === undefined) {
                return [];
            }
            const output: RelativePosition<any>[] = [];
            rawArray.forEach((raw) => {
                if (raw.__type !== undefined) {
                    output.push(new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw));
                }
            });
            return output;
        },
    })
    public get relativePositions(): RelativePosition<any>[] {
        const relativePostions: RelativePosition<any>[] = [];
        if (this._relativePositions !== undefined) {
            this._relativePositions.forEach((values: Map<string, RelativePosition<any>>) => {
                values.forEach((value) => {
                    relativePostions.push(value);
                });
            });
        }
        return relativePostions;
    }

    public set relativePositions(relativePostions: RelativePosition<any>[]) {
        this._relativePositions = new Map();
        relativePostions.forEach((relativePostion) => {
            this.addRelativePosition(relativePostion);
        });
    }

    public removeRelativePositions(referenceObjectUID: string): void {
        this._relativePositions.delete(referenceObjectUID);
    }

    /**
     * Add a relative position to this data object
     *
     * @param {RelativePosition} relativePosition Relative position to add
     */
    public addRelativePosition(relativePosition: RelativePosition<any>): void {
        if (relativePosition.referenceObjectUID === undefined) {
            return;
        }

        if (!this._relativePositions.has(relativePosition.referenceObjectUID)) {
            this._relativePositions.set(relativePosition.referenceObjectUID, new Map());
        }

        this._relativePositions
            .get(relativePosition.referenceObjectUID)
            .set(relativePosition.constructor.name, relativePosition);
    }

    /**
     * Get relative positions for a different target
     *
     * @param {string} [referenceObjectUID] Reference object identifier
     * @returns {RelativePosition[]} Array of relative positions for the reference object
     */
    public getRelativePositions(referenceObjectUID?: string): RelativePosition<any>[] {
        if (referenceObjectUID === undefined) {
            return this.relativePositions;
        } else if (this._relativePositions.has(referenceObjectUID)) {
            return Array.from(this._relativePositions.get(referenceObjectUID).values());
        } else {
            return undefined;
        }
    }

    /**
     * Get relative position of a specified object
     *
     * @param {string} referenceObjectUID Reference object identifier
     * @param {string} type Constructor type of the relative position
     * @returns {RelativePosition} Relative position to reference object
     */
    public getRelativePosition(referenceObjectUID: string, type?: string): RelativePosition<any> {
        if (this._relativePositions.has(referenceObjectUID)) {
            const positions = this._relativePositions.get(referenceObjectUID);
            if (type) {
                return positions.get(type);
            } else {
                return Array.from(positions.values())[0];
            }
        } else {
            return undefined;
        }
    }

    public hasRelativePosition(referenceObjectUID: string): boolean {
        return this._relativePositions.has(referenceObjectUID);
    }

    /**
     * Clone the data object
     *
     * @returns {DataObject} Cloned data object
     */
    public clone(): this {
        return DataSerializer.deserialize(DataSerializer.serialize(this));
    }
}
