import { TypedJSON } from "typedjson";

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
    
    public static serialize<T>(data: T): any {
        if (data === null || data === undefined) {
            return undefined;
        }

        const globalDataType = data.constructor;

        if (this.findTypeByName(data.constructor.name)) {
            const serialized = new TypedJSON(globalDataType as any).toPlainJson(data) as any;
            serialized['__type'] = globalDataType.name;
            return serialized;
        } else if (Array.isArray(data)) {
            const serializedResult = new Array();
            data.forEach(d => {
                if (d === null || d === undefined || d !== Object(d)) {
                    serializedResult.push(d);
                } else {
                    const dataType = d.constructor;
                    const serialized = new TypedJSON(dataType).toPlainJson(d) as any;
                    serialized['__type'] = dataType.name;
                    serializedResult.push(serialized);
                }
            });
            return serializedResult;
        } else {
            const serialized = new TypedJSON(globalDataType as any).toPlainJson(data) as any;
            serialized['__type'] = globalDataType.name;
            return serialized;
        }
    }

    public static deserialize<T>(serializedData: any, dataType?: new () => T): T;
    public static deserialize<T>(serializedData: any[], dataType?: new () => T): T[];
    public static deserialize<T>(serializedData: any, dataType?: new () => T): T | T[] {
        if (serializedData === null || serializedData === undefined) {
            return undefined;
        }

        if (Array.isArray(serializedData)) {
            const deserializedResult = new Array();
            serializedData.forEach(d => {
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
        } else {
            const detectedType = serializedData['__type'] !== undefined ? this.findTypeByName(serializedData['__type']) : Object;
            const finalType = dataType === undefined ? detectedType : dataType;
            if (finalType === undefined) {
                return serializedData;
            }
            return new TypedJSON(finalType).parse(serializedData);
        }
    }

}
