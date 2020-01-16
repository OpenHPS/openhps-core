import * as uuidv4 from 'uuid/v4';
import { DataObject } from './object/DataObject';

/**
 * Data frame that is passed through each node in a model.
 */
export class DataFrame {
    protected uid: string = uuidv4();
    protected createdTimestamp: number;
    protected source: DataObject;
    protected objects: DataObject[] = new Array<DataObject>();
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
    constructor(data?: any) {
        const timestamp = Date.now();
        this.setCreatedTimestamp(timestamp);
        if (data === undefined) {
            return;
        } else if (data instanceof DataFrame) {
            // Copy contents of data frame
            this.uid = data.getUID();
            this.createdTimestamp = data.getCreatedTimestamp();
            this.source = data.getSource();
            this.objects = data.getObjects();
        } else {
            // Parse data
            this.parseJSON(data);
        }
    }

    public serialize(): any {
        return {
            _class: this.constructor.name,
            uid: this.uid,
            createdTimestamp: this.createdTimestamp,
            source: this.source !== null ? this.source.serialize() : null,
            objects: this.objects,
            priority: this.priority,
        };
    }

    public static deserialize(json: any): DataFrame {
        /* tslint:disable */
        let cls = (global as any)[json['_class']];
        delete json['_class'];  // remove meta-property
        return Object.setPrototypeOf(json, cls.prototype);
    }

    /**
     * Parse the JSON object or string
     * @param json JSON object or string
     */
    public parseJSON(json: any): void {
        if (json === null) {
            return;
        }
        if (json.source !== undefined) {
            this.setSource(this.parseDataObject(json.source));
        }
        if (json.objects !== undefined) {
            json.objects.forEach((rawObject: any) => {
                this.addObject(this.parseDataObject(rawObject));
            });
        }
    }

    public parseDataObject(object: any): DataObject {
        if (typeof object === "string") {
            return new DataObject(object);
        }
        const dataObject = new DataObject();
        const objectKeys = Object.keys(object);
        return dataObject;
    }

    /**
     * Get the data frame unique identifier
     */
    public getUID(): string {
        return this.uid;
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
