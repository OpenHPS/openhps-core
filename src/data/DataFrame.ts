import * as uuidv4 from 'uuid/v4';
import { DataObject } from './object/DataObject';
import { SerializableObject, SerializableMember, SerializableMapMember } from './decorators';

/**
 * Data frame that is passed through each node in a model.
 */
@SerializableObject()
export class DataFrame {
    @SerializableMember()
    private _uid: string = uuidv4();
    private _createdTimestamp: number;
    private _source: DataObject;
    @SerializableMapMember(String, DataObject)
    private _objects: Map<string, DataObject> = new Map();

    /**
     * Create a new data frame
     * @param data Optional JSON to parse from
     */
    constructor(source?: DataObject) {
        const timestamp = Date.now();
        this.createdTimestamp = timestamp;
        this.source = source;
    }

    /**
     * Get the data frame unique identifier
     */
    public get uid(): string {
        return this._uid;
    }

    /**
     * Get the source object that captured the data frame
     */
    @SerializableMember()
    public get source(): DataObject {
        return this._source;
    }

    /**
     * Set the source object that captured the data frame
     * @param source Object that captured the data frame
     */
    public set source(source: DataObject) {
        this.addObject(source);
        this._source = source;
    }

    /**
     * Set data frame created timestamp (ISO 8601)
     * @param timestamp 
     */
    public set createdTimestamp(timestamp: number) {
        this._createdTimestamp = timestamp;
    }

    /**
     * Get data frame created timestamp (ISO 8601)
     */
    @SerializableMember()
    public get createdTimestamp(): number {
        return this._createdTimestamp;
    }

    /**
     * Get known objects used in this data frame
     */
    public getObjects<T extends DataObject>(dataType?: new () => T): T[] {
        if (dataType === undefined) {
            const filteredObjects = new Array();
            this._objects.forEach(object => {
                filteredObjects.push(object);
            });
            return filteredObjects;
        } else {
            const filteredObjects = new Array();
            this._objects.forEach(object => {
                if (object.constructor.name === dataType.name)
                    filteredObjects.push(object);
            });
            return filteredObjects;
        }
    }

    public getObjectByUID<T extends DataObject>(uid: string): T {
        return this._objects.get(uid) as T;
    }

    public hasObject(object: DataObject): boolean {
        return this._objects.has(object.uid);
    }

    /**
     * Add a new object relevant to this data frame
     * @param object Relevant object
     */
    public addObject(object: DataObject): void {
        if (object === undefined)
            return;
        this._objects.set(object.uid, object);
    }

    /**
     * Remove an object from the data frame
     * @param object Object to remove
     */
    public removeObject(object: DataObject): void {
        this._objects.delete(object.uid);
    }
}
