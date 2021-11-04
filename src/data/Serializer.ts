import { Serializer as JSONSerializer } from 'typedjson/lib/cjs/serializer';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import type { OptionsBase } from 'typedjson/lib/types/options-base';
import { Serializable } from 'typedjson';

export class Serializer extends JSONSerializer {
    defaultSerializer: SerializerFn<any, TypeDescriptor, any>;

    setDefaultSerializer(serializer: SerializerFn<any, TypeDescriptor, any>): this {
        this.defaultSerializer = serializer;
        return this;
    }

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        memberName: string,
        memberOptions?: OptionsBase,
    ): any {
        if (this.defaultSerializer) {
            const serializationStrategy: Map<Serializable<any>, SerializerFn<any, TypeDescriptor, any>> = this[
                'serializationStrategy'
            ];
            const mapProxy = new Proxy(serializationStrategy, {
                get: (target, p: PropertyKey) => {
                    if (p === 'get') {
                        return (key: Serializable<any>) => {
                            return target.get(key) ?? this.defaultSerializer;
                        };
                    }
                    return target[p];
                },
            });
            this['serializationStrategy'] = mapProxy;
        }
        const targetObject = super.convertSingleValue(sourceObject, typeDescriptor, memberName, memberOptions);
        if (memberName === undefined && typeof targetObject === 'object') {
            targetObject.__type = typeDescriptor.ctor.name;
        }
        return targetObject;
    }
}

export type SerializerFn<T, TD extends TypeDescriptor, Raw> = (
    sourceObject: T,
    typeDescriptor: TD,
    memberName: string,
    serializer: Serializer,
    memberOptions?: OptionsBase,
) => Raw;

export { TypeDescriptor, OptionsBase };
