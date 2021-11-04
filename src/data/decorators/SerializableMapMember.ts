import { jsonMapMember, IJsonMapMemberOptions, Serializable } from 'typedjson';
import { injectMemberOptions } from './utils';

/**
 * @param {Serializable<any>} keyConstructor Map key constructor
 * @param {Serializable<any>} valueConstructor Map value constructor
 * @param {SerializableMapMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMapMember(
    keyConstructor: Serializable<any>,
    valueConstructor: Serializable<any>,
    options?: SerializableMapMemberOptions,
): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        if (valueConstructor === Object && options === undefined) {
            options = {};
            options.deserializer = (json: any) => {
                const map = new Map<string, any>();
                Object.keys(json).forEach((key: string) => {
                    map.set(key, JSON.parse(json[key]));
                });
                return map;
            };
            options.serializer = (map: Map<string, unknown>) => {
                const json = {};
                map.forEach((value: unknown, key: string) => {
                    (json as any)[key] = JSON.stringify(value);
                });
                return json;
            };
        }

        jsonMapMember(keyConstructor, valueConstructor, options)(target, propertyKey);

        // Inject additional options if available
        if (options) {
            injectMemberOptions(target, propertyKey, options);
        }
    };
}

export interface SerializableMapMemberOptions extends IJsonMapMemberOptions {}
