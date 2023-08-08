import { v4 as uuidv4 } from 'uuid';
import { DataObject } from './object/DataObject';
import { SerializableObject, SerializableMember, SerializableMapMember } from './decorators';
import { ReferenceSpace } from './object/space';
import { TimeService } from '../service/TimeService';
import { DataSerializer } from './DataSerializer';
import { SensorObject } from './object';

/**
 * A data frame is information that is passed through each node in a positioning model.
 *
 * ![DataFrame content](media://images/dataframe.svg)
 *
 * ## Usage
 *
 * ### Creation
 * A data frame can be created with an optional source {@link DataObject} that represents
 * the object responsible for generating the frame.
 * ```typescript
 * const dataFrame = new DataFrame(new DataObject("phone"));
 * ```
 *
 * ### Creating a custom DataFrame
 * Custom data frames can be created by extending the default {@link DataFrame} class. Important when handling
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
 *
 * ### Adding {@link DataObject}s
 * Adding data object will clone the data objects to the data frame. Any changes made to the object after cloning will not
 * be applied to the data frame.
 */
@SerializableObject()
export class DataFrame {
    /**
     * Data frame unique identifier
     */
    @SerializableMember({
        primaryKey: true,
    })
    uid: string = uuidv4();
    /**
     * Data frame created timestamp (ISO 8601)
     */
    @SerializableMember({
        index: true,
    })
    createdTimestamp: number;
    /**
     * Data frame sensor data pheonomenon timestamp (ISO 8601)
     */
    @SerializableMember({
        index: true,
    })
    phenomenonTimestamp?: number;
    @SerializableMember({
        name: 'source',
    })
    private _source: string;
    @SerializableMapMember(String, DataObject, {
        name: 'objects',
    })
    private _objects: Map<string, DataObject> = new Map();

    /**
     * Create a new data frame
     * @param {DataFrame} frame Data frame to copy
     */
    constructor(frame?: DataFrame);
    /**
     * Create a new data frame
     * @param {DataObject} source Source data object
     */
    constructor(source?: DataObject);
    constructor(data?: any) {
        this.createdTimestamp = TimeService.now();
        if (data instanceof DataFrame) {
            // Copy data frame
            this.createdTimestamp = data.createdTimestamp;
            this.phenomenonTimestamp = data.phenomenonTimestamp;
            this.uid = data.uid;
            this._objects = data._objects;
            this.source = data.source;
        } else if (data instanceof DataObject) {
            this.source = data;
        }
        this.phenomenonTimestamp = this.phenomenonTimestamp ?? this.createdTimestamp;
    }

    /**
     * Source object clone that captured the data frame
     * @returns {DataObject} Source data object
     */
    get source(): DataObject {
        return this.getObjectByUID(this._source);
    }

    /**
     * Set the source object clone that captured the data frame
     * @param {DataObject} object Source data object
     */
    set source(object: DataObject) {
        if (object === undefined) return;
        this.addObject(object.clone());
        this._source = object.uid;
    }

    /**
     * Get known sensor objects used in this data frame
     * @param {typeof SensorObject} type Sensor type
     * @param {string} [defaultUID] Default UID. When sensor is not added, it will be created
     * @returns {SensorObject} Found data objects
     */
    getSensor<T extends SensorObject>(type: new (uid?: string) => T, defaultUID?: string): T {
        let sensor = this.getObjects(type)[0];
        if (!sensor && defaultUID !== undefined) {
            sensor = new type(defaultUID);
            this.addObject(sensor);
        }
        return sensor;
    }

    /**
     * Get known objects used in this data frame
     * @param {typeof DataObject} dataType Data object type
     * @returns {DataObject[]} Array of found data objects
     */
    getObjects<T extends DataObject>(dataType?: new () => T): T[] {
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

    /**
     * Get a specific object by its identifier
     * @param {string} uid Object UID
     * @returns {DataObject} Data object if found
     */
    getObjectByUID<T extends DataObject>(uid: string): T {
        return this._objects.get(uid) as T;
    }

    /**
     * Check if the data frame has an object
     * @param {DataObject} object Data object to find
     * @returns {boolean} Object exist
     */
    hasObject(object: DataObject): boolean {
        return this._objects.has(object.uid);
    }

    /**
     * Add a new object relevant to this data frame
     * @param {DataObject} object Relevant object
     * @returns {DataFrame} instance
     */
    addObject(object: DataObject): this {
        if (object === undefined) return this;
        this._objects.set(object.uid, object);
        return this;
    }

    /**
     * Add a new sensor relevant to this data frame
     * @param {SensorObject} object Relevant sensor
     * @returns {DataFrame} instance
     */
    addSensor(object: SensorObject): this {
        return this.addObject(object);
    }

    /**
     * Add a new reference space relevant to this data frame.
     * @alias addObject Alias for addObject
     * @param {ReferenceSpace} referenceSpace Relevant reference space
     */
    addReferenceSpace(referenceSpace: ReferenceSpace): void {
        this.addObject(referenceSpace);
    }

    /**
     * Remove an object from the data frame
     * @param {DataObject} object Object to remove
     */
    removeObject(object: DataObject): void {
        this._objects.delete(object.uid);
    }

    /**
     * Clear all objects
     * @param {Function} object object filter
     * @param objectFilter
     */
    clearObjects(objectFilter?: (object: DataObject) => boolean): void {
        const filter = objectFilter ?? ((object: DataObject) => true);
        this._objects.forEach((obj, key) => {
            if (filter(obj)) {
                this._objects.delete(key);
            }
        });
    }

    /**
     * Clone the data frame
     * @returns {DataFrame} Cloned data frame
     */
    clone(): this {
        return DataSerializer.clone(this);
    }
}
