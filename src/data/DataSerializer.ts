import { TypedJSON } from "typedjson";
import { isArray } from "util";

/**
 * Data serializer
 */
export class DataSerializer {
    private static _serializableTypes: Map<string, new () => any> = new Map();

    public static registerType(type: new () => any): void {
        this._serializableTypes.set(type.name, type);
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

        if (isArray(data)) {
            const serializedResult = new Array();
            data.forEach(d => {
                if (d === null || d === undefined) {
                    serializedResult.push(d);
                } else {
                    const dataType = Object.getPrototypeOf(d).constructor;
                    const serialized = new TypedJSON(dataType).toPlainJson(d) as any;
                    serialized['__type'] = dataType.name;
                    serializedResult.push(serialized);
                }
            });
            return serializedResult;
        } else {
            const dataType = Object.getPrototypeOf(data).constructor;
            const serialized = new TypedJSON(dataType).toPlainJson(data) as any;
            serialized['__type'] = dataType.name;
            return serialized;
        }
    }

    public static deserialize<T>(serializedData: any, dataType?: new () => T): T;
    public static deserialize<T>(serializedData: any[], dataType?: new () => T): T[];
    public static deserialize<T>(serializedData: any, dataType?: new () => T): T | T[] {
        if (serializedData === null || serializedData === undefined) {
            return undefined;
        }

        if (isArray(serializedData)) {
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
