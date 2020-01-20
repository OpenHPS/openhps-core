import { jsonMapMember } from "typedjson";
import { IJsonMapMemberOptions } from "typedjson/js/typedjson/json-map-member";

export function SerializableMapMember(keyConstructor: Function, valueConstructor: Function, options?: IJsonMapMemberOptions): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        if (valueConstructor instanceof Object && options === undefined) {
            options = {};
            options.deserializer = (json: any) => {
                const map = new Map<string, any>();
                Object.keys(json).forEach((key: string) => {
                    map.set(key, JSON.parse(json[key]));
                });
                return map;
            };

            options.serializer = (map: Map<string, Object>) => {
                const json = {};
                map.forEach((value: Object, key: string) => {
                    (json as any)[key] = JSON.stringify(value);
                });
                return json;
            };
        }
        jsonMapMember(keyConstructor, valueConstructor, options)(target, propertyKey);
    };
}
