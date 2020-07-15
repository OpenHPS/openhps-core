import { AbsolutePosition } from "../position/AbsolutePosition";
import { RelativePosition } from '../position/RelativePosition';
import { TypedJSON } from 'typedjson';
import { SerializableObject, SerializableMember, SerializableArrayMember, SerializableMapMember } from '../decorators';
import * as uuidv4 from 'uuid/v4';
import { DataSerializer } from '../DataSerializer';

/**
 * A data object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or [[Space]].
 */
@SerializableObject()
export class DataObject {
    private _uid: string;
    private _displayName: string;
    private _currentPosition: AbsolutePosition;
    private _relativePositions: Map<string, Map<string, RelativePosition>> = new Map();
    private _currentPositionDirty: boolean = false;
    private _relativePositionDirty: boolean = false;
    private _parentUID: string;
    @SerializableMapMember(String, Object)
    private _nodeData: Map<string, any> = new Map();
    @SerializableMember()
    public createdTimestamp: number;

    constructor(uid: string = uuidv4()) {
        this.uid = uid;
        this.createdTimestamp = new Date().getTime();
    }

    public merge(object: DataObject): DataObject {
        if (object.displayName !== undefined)
            this.displayName = object.displayName;
        if (object.currentPosition !== undefined)
            this.currentPosition = object.currentPosition;
        object._nodeData.forEach((value, key) => {
            this._nodeData.set(key, value);
        });
        if (this.createdTimestamp > object.createdTimestamp) {
            this.createdTimestamp = object.createdTimestamp;
        }
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
     */
    @SerializableMember({
        deserializer(raw: any): AbsolutePosition {
            if (raw === undefined) {
                return undefined;
            }
            return new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw);
        }
    })
    public get currentPosition(): AbsolutePosition {
        return this._currentPosition;
    }

    /**
     * Set the current absolute position of the object
     */
    public set currentPosition(position: AbsolutePosition) {
        this._currentPosition = position;
        this._currentPositionDirty = true;
    }

    /**
     * Get relative positions
     */
    @SerializableArrayMember(RelativePosition, {
        deserializer(rawArray: any[]): RelativePosition[] {
            if (rawArray === undefined) {
                return [];
            }
            const output = new Array();
            rawArray.forEach(raw => {
                if (raw.__type === undefined) {
                    output.push(new TypedJSON(RelativePosition).parse(raw));
                } else {
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
        this._relativePositionDirty = true;
    }

    public removeRelativePositions(referenceObjectUID: string): void {
        this._relativePositions.delete(referenceObjectUID);
        this._relativePositionDirty = true;
    }

    public addRelativePosition(relativePosition: RelativePosition): void {
        if (relativePosition.referenceObjectUID === undefined) {
            return;
        }

        if (!this._relativePositions.has(relativePosition.referenceObjectUID)) {
            this._relativePositions.set(relativePosition.referenceObjectUID, new Map());
        }

        this._relativePositions.get(relativePosition.referenceObjectUID).set(relativePosition.constructor.name, relativePosition);
        this._relativePositionDirty = true;
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
        this.addNodeData(nodeUID, data);
    }

    /**
     * Add node data
     * @param nodeUID Node UID 
     * @param data Node data to save
     */
    public addNodeData(nodeUID: string, data: any): void {
        this._nodeData.set(nodeUID, data);
    }

    public isCurrentPositionDirty(): boolean {
        return this._currentPositionDirty;
    }

    public isRelativePositionDirty(): boolean {
        return this._relativePositionDirty;
    }
}
