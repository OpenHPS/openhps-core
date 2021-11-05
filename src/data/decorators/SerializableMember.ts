import 'reflect-metadata';
import { jsonMember, JsonObjectMetadata, AnyT, IndexedObject, Constructor } from 'typedjson';
import { injectMemberOptions } from './utils';
import { DataSerializer } from '../DataSerializer';
import { SerializableMemberOptions } from './options';

/**
 * @param {SerializableMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMember(options?: SerializableMemberOptions | IndexedObject): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        jsonMember(options)(target, propertyKey);

        // Inject additional options if available
        if (options) {
            injectMemberOptions(target, propertyKey, {
                index: options.index || options.primaryKey,
                ...options,
            });
        }

        // Detect generic types that have no deserialization or constructor specified
        const reflectPropCtor: Constructor<any> = Reflect.getMetadata('design:type', target, propertyKey);
        if (
            reflectPropCtor === Object &&
            (!options || (!options.deserializer && !Object.keys(options).includes('constructor')))
        ) {
            const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
            const existingOptions = meta.dataMembers.get(options ? options.name || propertyKey : propertyKey);
            existingOptions.deserializer = (json) => DataSerializer.deserialize(json);
            existingOptions.serializer = (obj) => DataSerializer.serialize(obj);
            existingOptions.type = () => AnyT;
        }
    };
}
