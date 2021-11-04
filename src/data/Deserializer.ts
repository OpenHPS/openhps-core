import { Deserializer as JSONDeserializer } from 'typedjson/lib/cjs/deserializer';
import type { ConcreteTypeDescriptor, TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import type { OptionsBase } from 'typedjson/lib/types/options-base';
import { IndexedObject, Serializable } from 'typedjson';

export class Deserializer extends JSONDeserializer {
    defaultDeserializer: DeserializerFn<any>;

    setDefaultDeserializer(deserializer: DeserializerFn<any>): this {
        this.defaultDeserializer = deserializer;
        return this;
    }

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName = 'object',
        memberOptions?: OptionsBase,
    ): any {
        if (this.defaultDeserializer) {
            const mapProxy = new Proxy(this['deserializationStrategy'], {
                get: (target, p: PropertyKey) => {
                    if (p === 'get') {
                        return (key: Serializable<any>) => {
                            return target.get(key) ?? this.defaultDeserializer;
                        };
                    }
                    return target[p];
                },
            });
            this['deserializationStrategy'] = mapProxy;
        }
        return super.convertSingleValue(sourceObject, typeDescriptor, knownTypes, memberName, memberOptions);
    }
}

export type DeserializerFn<T> = (
    sourceObject: IndexedObject,
    typeDescriptor: ConcreteTypeDescriptor,
    knownTypes: Map<string, Serializable<any>>,
    memberName: string,
    deserializer: Deserializer,
) => IndexedObject | T | undefined;
