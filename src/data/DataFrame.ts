import 'reflect-metadata';
import * as uuidv4 from 'uuid/v4';
import { DataObject } from './object/DataObject';
import { SerializableObject, SerializableMember, SerializableMapMember } from './decorators';
import { TypedJSON } from 'typedjson';

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
     * Serialize the data frame
     */
    public serialize(): string {
        return JSON.stringify(this.toJson());
    }

    /**
     * Deserialize the database
     * @param serialized Serialized data frame
     * @param dataType Data type to serialize to
     */
    public static deserialize<T extends DataFrame>(serialized: string, dataType: new () => T): T {
        const serializer = new TypedJSON(dataType);
        return serializer.parse(serialized);
    }

    public toJson(): any {
        const serializer = new TypedJSON(Object.getPrototypeOf(this).constructor);
        const json = serializer.toPlainJson(this) as any;
        json.__type = this.constructor.name;
        return json;
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
            return this._objects as unknown as T[];
        } else {
            const filteredObjects = new Array();
            this._objects.forEach(object => {
                if (object.constructor.name === dataType.name)
                    filteredObjects.push(object);
            });
            return filteredObjects;
        }
    }

    /**
     * Add a new object relevant to this data frame
     * @param object Relevant object
     */
    public addObject(object: DataObject): void {
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
