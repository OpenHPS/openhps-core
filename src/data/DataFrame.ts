import { v4 as uuidv4 } from 'uuid';
import { DataObject } from './object/DataObject';
import { SerializableObject, SerializableMember, SerializableMapMember } from './decorators';
import { ReferenceSpace } from './object';

/**
 * Data frame that is passed through each node in a model.
 * 
 * ## Usage
 * 
 * ### Creation
 * A data frame can be created with an optional source [[DataObject]] that represents
 * the object responsible for generating the frame.
 * ```typescript
 * const dataFrame = new DataFrame(new DataObject("phone"));
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
    private _source: DataObject;
    @SerializableMapMember(String, DataObject)
    private _objects: Map<string, DataObject> = new Map();

    /**
     * Create a new data frame
     *
     * @param data Optional JSON to parse from
     * @param source
     */
    constructor(source?: DataObject) {
        const timestamp = Date.now();
        this.createdTimestamp = timestamp;
        this.source = source;
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
     *
     * @param source Object that captured the data frame
     */
    public set source(source: DataObject) {
        this.addObject(source);
        this._source = source;
    }

    /**
     * Get known objects used in this data frame
     *
     * @param dataType
     */
    public getObjects<T extends DataObject>(dataType?: new () => T): T[] {
        if (dataType === undefined) {
            const filteredObjects: T[] = [];
            this._objects.forEach(object => {
                filteredObjects.push(object as T);
            });
            return filteredObjects;
        } else {
            const filteredObjects: T[] = [];
            this._objects.forEach(object => {
                if (object.constructor.name === dataType.name)
                    filteredObjects.push(object as T);
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
     * @param object Relevant object
     */
    public addObject(object: DataObject): void {
        if (object === undefined)
            return;
        this._objects.set(object.uid, object);
    }

    /**
     * Add a new reference space relevant to this data frame
     *
     * @param referenceSpace Relevant reference space
     */
    public addReferenceSpace(referenceSpace: ReferenceSpace): void {
        this.addObject(referenceSpace);
    }
    
    /**
     * Remove an object from the data frame
     *
     * @param object Object to remove
     */
    public removeObject(object: DataObject): void {
        this._objects.delete(object.uid);
    }
}
