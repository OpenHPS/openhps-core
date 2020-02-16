import { TypedJSON } from "typedjson";

export class DataSerializer {
    private static _serializableTypes: Map<string, new () => any> = new Map();

    public static registerType(type: new () => any): void {
        this._serializableTypes.set(type.name, type);
    }

    public static findTypeByName(name: string): new () => any {
        return this._serializableTypes.get(name);
    }
      
    public static serialize<T>(data: T): any {
        if (data === null || data === undefined) {
            return undefined;
        }
        const dataType = Object.getPrototypeOf(data).constructor;
        const serialized = new TypedJSON(dataType).toPlainJson(data) as any;
        serialized['__type'] = dataType.name;
        return serialized;
    }

    public static deserialize<T>(serializedData: any, dataType?: new () => T): T {
        if (serializedData === null || serializedData === undefined) {
            return undefined;
        }
        const detectedType = serializedData['__type'] !== undefined ? this.findTypeByName(serializedData['__type']) : Object;
        return new TypedJSON(dataType === undefined ? detectedType : dataType).parse(serializedData);
    }
}
