import { AbsoluteLocation } from "../location/AbsoluteLocation";
import { RelativeLocation } from '../location/RelativeLocation';
import { Shape } from "../geometry/Shape";
import { TypedJSON } from 'typedjson';
import { SerializableObject, SerializableMember, SerializableArrayMember, SerializableMapMember } from '../decorators';
import * as uuidv4 from 'uuid/v4';
import { DataSerializer } from '../DataSerializer';
import { ProcessingNode } from "../../nodes";

/**
 * A data object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or room.
 */
@SerializableObject()
export class DataObject {
    @SerializableMember()
    private _uid: string;
    private _displayName: string;
    private _absoluteLocation: AbsoluteLocation;
    private _relativeLocations: Map<string, RelativeLocation[]> = new Map();
    private _shape: Shape;
    @SerializableMapMember(String, Object)
    private _nodeData: Map<string, any> = new Map();

    constructor(uid: string = uuidv4()) {
        this.uid = uid;
    }

    public merge(object: DataObject): DataObject {
        if (object.displayName !== undefined)
            this.displayName = object.displayName;
        if (object.shape !== undefined)
            this.shape = object.shape;
        object._nodeData.forEach((value, key) => {
            this._nodeData.set(key, value);
        });
        return this;
    }
    
    /**
     * Get the object identifier
     */
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
     * Get the absolute location of the object
     */
    @SerializableMember({
        deserializer(raw: any): AbsoluteLocation {
            if (raw === undefined) {
                return undefined;
            }
            return new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw);
        }
    })
    public get absoluteLocation(): AbsoluteLocation {
        return this._absoluteLocation;
    }

    /**
     * Set the absolute location of the object
     * @param absoluteLocation Absolute location of the object
     */
    public set absoluteLocation(absoluteLocation: AbsoluteLocation) {
        this._absoluteLocation = absoluteLocation;
    }

    /**
     * Get object shape
     */
    @SerializableMember()
    public get shape(): Shape {
        return this._shape;
    }

    /**
     * Set object shape
     * @param size Object shape
     */
    public set shape(shape: Shape) {
        this._shape = shape;
    }

    /**
     * Get relative locations
     */
    @SerializableArrayMember(RelativeLocation, {
        deserializer(rawArray: any[]): RelativeLocation[] {
            const output = new Array();
            rawArray.forEach(raw => {
                if (raw === undefined) {
                    return undefined;
                }
                output.push(new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw));
            });
            return output;
        }
    })
    public get relativeLocations(): RelativeLocation[] {
        const relativeLocations: RelativeLocation[] = new Array();
        if (this._relativeLocations !== undefined) {
            this._relativeLocations.forEach((values: RelativeLocation[]) => {
                values.forEach(value => { relativeLocations.push(value); });
            });
        }
        return relativeLocations;
    }

    public set relativeLocations(relativeLocations: RelativeLocation[]) {
        this._relativeLocations = new Map();
        relativeLocations.forEach(relativeLocation => {
            this.addRelativeLocation(relativeLocation);
        });
    }

    public addRelativeLocation(relativeLocation: RelativeLocation): void {
        if (this._relativeLocations.has(relativeLocation.referenceObjectUID)) {
            this._relativeLocations.get(relativeLocation.referenceObjectUID).push(relativeLocation);
        } else {
            this._relativeLocations.set(relativeLocation.referenceObjectUID, new Array(relativeLocation));
        }
    }

    public hasRelativeLocation(target: string): boolean{
        return this._relativeLocations.has(target);
    }

    /**
     * Get node data
     * @param nodeUID Node UID 
     */
    public getNodeData(nodeUID: string): any {
        return this._nodeData.get(nodeUID);
    }

    /**
     * Add node data
     * @param nodeUID Node UID 
     * @param data Node data to save
     */
    public setNodeData(nodeUID: string, data: any): void {
        this._nodeData.set(nodeUID, data);
    }
}
