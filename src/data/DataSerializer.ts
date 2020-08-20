import { TypedJSON } from 'typedjson';

/**
 * Data serializer allows the serialization of objects using the [[SerializableObject]] decorator.
 *
 * ## Usage
 * Objects are registered upon loading with the [[SerializableObject]] decorator.
 * Manual registration is possible using:
 * ```typescript
 * DataSerializer.registerType(MyObjectClass);
 * ```
 */
export class DataSerializer {
    private static _serializableTypes: Map<string, new () => any> = new Map();

    public static registerType(type: new () => any): void {
        this._serializableTypes.set(type.name, type);
    }

    public static unregisterType(type: new () => any): void {
        if (this._serializableTypes.has(type.name)) {
            this._serializableTypes.delete(type.name);
        }
    }

    public static get serializableTypes(): Array<new () => any> {
        return Array.from(this._serializableTypes.values());
    }

    public static findTypeByName(name: string): new () => any {
        return this._serializableTypes.get(name);
    }

    /**
     * Serialize data
     *
     * @param data Data to serialize
     */
    public static serialize<T>(data: T): any {
        if (data === null || data === undefined) {
            return undefined;
        }

        const globalDataType = data.constructor;

        // First check if it is a registered type
        // this is important as some serializable classes
        // may extend an array
        if (this.findTypeByName(data.constructor.name)) {
            return DataSerializer.serializeObject(data, globalDataType as new () => T);
        } else if (Array.isArray(data)) {
            return DataSerializer.serializeArray(data);
        } else {
            return DataSerializer.serializeObject(data, globalDataType as new () => T);
        }
    }

    protected static serializeArray<T>(data: T[]): any[] {
        const serializedResult: any[] = [];
        data.forEach((d) => {
            if (d === null || d === undefined || d !== Object(d)) {
                serializedResult.push(d);
            } else {
                const dataType = d.constructor;
                serializedResult.push(DataSerializer.serializeObject(d, dataType as new () => T));
            }
        });
        return serializedResult;
    }

    protected static serializeObject<T>(data: T, dataType: new () => T): any {
        const serialized = new TypedJSON(dataType as new () => T).toPlainJson(data) as any;
        serialized['__type'] = dataType.name;
        return serialized;
    }

    /**
     * Deserialize data
     *
     * @param serializedData Data to deserialze
     * @param dataType Optional data type to specify deserialization type
     */
    public static deserialize<T>(serializedData: any, dataType?: new () => T): T;
    public static deserialize<T>(serializedData: any[], dataType?: new () => T): T[];
    public static deserialize<T>(serializedData: any, dataType?: new () => T): T | T[] {
        if (serializedData === null || serializedData === undefined) {
            return undefined;
        }

        if (Array.isArray(serializedData)) {
            return DataSerializer.deserializeArray(serializedData, dataType);
        } else {
            const detectedType =
                serializedData['__type'] !== undefined ? this.findTypeByName(serializedData['__type']) : Object;
            const finalType = dataType === undefined ? detectedType : dataType;
            if (finalType === undefined) {
                return serializedData;
            }
            return new TypedJSON(finalType).parse(serializedData);
        }
    }

    protected static deserializeArray<T>(serializedData: any[], dataType?: new () => T): T[] {
        const deserializedResult: T[] = [];
        serializedData.forEach((d) => {
            if (d === null || d === undefined) {
                deserializedResult.push(d);
            } else {
                const detectedType = d['__type'] !== undefined ? this.findTypeByName(d['__type']) : Object;
                const finalType = dataType === undefined ? detectedType : dataType;
                if (finalType === undefined) {
                    deserializedResult.push(d);
                }
                deserializedResult.push(new TypedJSON(finalType).parse(d));
            }
        });
        return deserializedResult;
    }
}
