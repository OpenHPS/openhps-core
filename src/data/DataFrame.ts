import { v4 as uuidv4 } from 'uuid';
import { DataObject } from './object/DataObject';
import { SerializableObject, SerializableMember, SerializableMapMember } from './decorators';
import { ReferenceSpace } from './object';
import { TimeService } from '../service';
import { DataSerializer } from './DataSerializer';

/**
 * A data frame is information that is passed through each node in a positioning model.
 *
 * ![DataFrame content](media://images/dataframe.svg)
 *
 * ## Usage
 *
 * ### Creation
 * A data frame can be created with an optional source [[DataObject]] that represents
 * the object responsible for generating the frame.
 * ```typescript
 * const dataFrame = new DataFrame(new DataObject("phone"));
 * ```
 *
 * ### Creating a custom DataFrame
 * Custom data frames can be created by extending the default [[DataFrame]] class. Important when handling
 * data frames (and objects) is to add serializable decorators.
 * ```typescript
 * import { DataFrame, SerializableObject, SerializableArrayMember } from '@openhps/core';
 *
 * @SerializableObject()
 * export class CustomDataFrame extends DataFrame {
 *     @SerialisableArrayMember(Number)
 *     public customFrameAttribute: number[];
 * }
 * ```
 */
@SerializableObject()
export class DataFrame {
    /**
     * Data frame unique identifier
     */
    @SerializableMember()
    public uid: string = uuidv4();
    /**
     * Data frame created timestamp (ISO 8601)
     */
    @SerializableMember()
    public createdTimestamp: number;
    @SerializableMember()
    private _source: string;
    @SerializableMapMember(String, DataObject)
    private _objects: Map<string, DataObject> = new Map();

    /**
     * Create a new data frame
     *
     * @param {DataFrame} frame Data frame to copy
     */
    constructor(frame?: DataFrame);
    /**
     * Create a new data frame
     *
     * @param {DataObject} source Source data object
     */
    constructor(source?: DataObject);
    constructor(data?: any) {
        this.createdTimestamp = TimeService.now();
        if (data instanceof DataFrame) {
            // Copy data frame
            this.createdTimestamp = data.createdTimestamp;
            this.uid = data.uid;
            this._objects = data._objects;
            this.source = data.source;
        } else if (data instanceof DataObject) {
            this.source = data;
        }
    }

    /**
     * Source object that captured the data frame
     *
     * @returns {DataObject} Source data object
     */
    public get source(): DataObject {
        return this.getObjectByUID(this._source);
    }

    public set source(object: DataObject) {
        if (object === undefined) return;
        this.addObject(object);
        this._source = object.uid;
    }

    /**
     * Get known objects used in this data frame
     *
     * @param {new () => DataObject} dataType Data object type
     * @returns {DataObject[]} Array of found data objects
     */
    public getObjects<T extends DataObject>(dataType?: new () => T): T[] {
        if (dataType === undefined) {
            const filteredObjects: T[] = [];
            this._objects.forEach((object) => {
                filteredObjects.push(object as T);
            });
            return filteredObjects;
        } else {
            const filteredObjects: T[] = [];
            this._objects.forEach((object) => {
                if (object.constructor.name === dataType.name) filteredObjects.push(object as T);
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
     *
     * @param {DataObject} object Relevant object
     */
    public addObject(object: DataObject): void {
        if (object === undefined) return;
        this._objects.set(object.uid, object);
    }

    /**
     * Add a new reference space relevant to this data frame
     *
     * @param {ReferenceSpace} referenceSpace Relevant reference space
     */
    public addReferenceSpace(referenceSpace: ReferenceSpace): void {
        this.addObject(referenceSpace);
    }

    /**
     * Remove an object from the data frame
     *
     * @param {DataObject} object Object to remove
     */
    public removeObject(object: DataObject): void {
        this._objects.delete(object.uid);
    }

    /**
     * Clone the data frame
     *
     * @returns {DataFrame} Cloned data frame
     */
    public clone(): this {
        return DataSerializer.deserialize(DataSerializer.serialize(this));
    }
}
