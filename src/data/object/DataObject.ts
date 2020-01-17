import 'reflect-metadata';
import { AbsoluteLocation, RelativeLocation } from "../location";
import { Shape } from "../geometry";
import { jsonObject, jsonMember, jsonMapMember, jsonArrayMember } from 'typedjson';

/**
 * A data object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or room.
 */
@jsonObject
export class DataObject {
    @jsonMember
    private _uid: string;
    private _displayName: string;
    private _absoluteLocation: AbsoluteLocation;
    private _relativeLocations: RelativeLocation[] = new Array();
    private _shape: Shape;
    @jsonMapMember(String, Object)
    private _nodeData: Map<string, Object> = new Map();

    constructor(uid: string = null) {
        this.uid = uid;
    }

    public merge(object: DataObject): DataObject {
        if (object.displayName !== undefined)
            this.displayName = object.displayName;
        if (object.shape !== undefined)
            this.shape = object.shape;
        if (object.absoluteLocation !== undefined)
            this.absoluteLocation = object.absoluteLocation;
        object.relativeLocations.forEach(location => {
            this.relativeLocations.push(location);
        });
        if (object.absoluteLocation !== undefined)
            this.absoluteLocation = object.absoluteLocation;
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
    @jsonMember
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
    @jsonMember
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
    @jsonMember
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
    @jsonArrayMember(RelativeLocation)
    public get relativeLocations(): RelativeLocation[] {
        return this._relativeLocations;
    }

    public set relativeLocations(relativeLocations: RelativeLocation[]) {
        this._relativeLocations = relativeLocations;
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
