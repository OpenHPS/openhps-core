import 'reflect-metadata';
import * as uuidv4 from 'uuid/v4';
import { DataObject } from './object/DataObject';
import { jsonObject, jsonMember, jsonArrayMember, TypedJSON } from 'typedjson';

/**
 * Data frame that is passed through each node in a model.
 */
@jsonObject
export class DataFrame {
    @jsonMember
    protected uid: string = uuidv4();
    @jsonMember
    protected createdTimestamp: number;
    @jsonMember
    protected source: DataObject;
    @jsonArrayMember(DataObject)
    protected objects: DataObject[] = new Array<DataObject>();
    @jsonMember
    protected priority: number = -1;

    /**
     * Create a new data frame based on another
     * @param dataFrame Optional data frame to copy from
     */
    constructor(dataFrame?: DataFrame)
    /**
     * Create a new data frame
     * @param data Optional JSON to parse from
     */
    constructor() {
        const timestamp = Date.now();
        this.setCreatedTimestamp(timestamp);
    }

    /**
     * Get the data frame unique identifier
     */
    public getUID(): string {
        return this.uid;
    }

    public serialize(): string {
        const serializer = new TypedJSON(Object.getPrototypeOf(this).constructor);
        return serializer.stringify(this);
    }

    public static deserialize<T extends DataFrame>(serialized: string, dataType: new () => T): T {
        const serializer = new TypedJSON(dataType);
        return serializer.parse(serialized);
    }

    /**
     * Get the source object that captured the data frame
     */
    public getSource(): DataObject {
        return this.source;
    }

    /**
     * Set the source object that captured the data frame
     * @param source Object that captured the data frame
     */
    public setSource(source: DataObject): void {
        this.source = source;
    }

    /**
     * Set data frame created timestamp (ISO 8601)
     * @param timestamp 
     */
    public setCreatedTimestamp(timestamp: number): void {
        this.createdTimestamp = timestamp;
    }

    /**
     * Get data frame created timestamp (ISO 8601)
     */
    public getCreatedTimestamp(): number {
        return this.createdTimestamp;
    }

    /**
     * Get known objects used in this data frame
     */
    public getObjects<T extends DataObject>(dataType?: new () => T): T[] {
        if (dataType === undefined) {
            return this.objects as unknown as T[];
        } else {
            const filteredObjects = new Array();
            this.objects.forEach(object => {
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
        this.objects.push(object);
    }

    /**
     * Remove an object from the data frame
     * @param object Object to remove
     */
    public removeObject(object: DataObject): void {
        this.objects.splice(this.objects.indexOf(object), 1);
    }
    
    /**
     * Get priority of the data frame.
     * Priority is used when merging data frames from multiple streams.
     * 
     * @returns Number (higher is higher priority)
     */
    public getPriority(): number {
        return this.priority;
    } 

    /**
     * Set the priority of the data frame
     * @param priority Priority number (higher number is higher priority)
     */
    public setPriority(priority: number): void {
        this.priority = priority;
    }
}
