import { Serializer as JSONSerializer } from 'typedjson/lib/cjs/serializer';
import type { ConcreteTypeDescriptor, TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import { ensureTypeDescriptor } from 'typedjson/lib/cjs/type-descriptor';
import { IndexedObject, JsonObjectMetadata, Serializable, TypeHintEmitter } from 'typedjson';
import { MemberOptionsBase } from './decorators/options';
import { ObjectMemberMetadata } from './decorators/metadata';
import { isInstanceOf, isValueDefined, nameof } from 'typedjson/lib/cjs/helpers';
import { mergeOptions } from 'typedjson/lib/cjs/options-base';
import type { OptionsBase } from 'typedjson/lib/types/options-base';

export class Serializer extends JSONSerializer {
    protected declare options?: OptionsBase;
    protected declare typeHintEmitter: TypeHintEmitter;
    protected declare serializationStrategy: Map<Serializable<any>, SerializerFn<any, TypeDescriptor, any>>;
    protected errorHandler: (error: Error) => void = (e: Error) => {
        e.message = e.message.replace('@jsonObject', '@SerializableObject()');
        e.message = e.message.replace('@jsonMember', '@SerializableMember()');
        e.message = e.message.replace('@jsonSetMember', '@SerializableSetMember()');
        e.message = e.message.replace('@jsonMapMember', '@SerializableMapMember()');
        e.message = e.message.replace('@jsonArrayMember', '@SerializableArrayMember()');
        throw e;
    };
    declare setSerializationStrategy: (
        type: Serializable<any>,
        serializer: SerializerFn<any, TypeDescriptor, any>,
    ) => void;
    declare setTypeHintEmitter: (typeEmitterCallback: TypeHintEmitter) => void;
    declare getTypeHintEmitter: () => TypeHintEmitter;
    declare setErrorHandler: (errorHandlerCallback: (error: Error) => void) => void;
    declare getErrorHandler: () => (error: Error) => void;
    declare retrievePreserveNull: (memberOptions?: MemberOptionsBase) => boolean;

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        memberName?: string,
        memberOptions?: ObjectMemberMetadata,
        serializerOptions?: any,
    ): any {
        const targetObject = this._convertSingleValue(
            sourceObject,
            typeDescriptor,
            memberName,
            memberOptions,
            serializerOptions,
        );
        if (memberName === undefined && typeof targetObject === 'object') {
            targetObject.__type = typeDescriptor.ctor.name;
        }
        return targetObject;
    }

    private _convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        memberName?: string,
        memberOptions?: ObjectMemberMetadata,
        serializerOptions?: any,
    ): any {
        if (this.retrievePreserveNull(memberOptions) && sourceObject === null) {
            return null;
        }
        if (!isValueDefined(sourceObject)) {
            return;
        }

        if (!isInstanceOf(sourceObject, typeDescriptor.ctor)) {
            const expectedName = nameof(typeDescriptor.ctor);
            const actualName = nameof(sourceObject.constructor);

            this.errorHandler(
                new TypeError(
                    `Could not serialize '${memberName}': expected '${expectedName}',` + ` got '${actualName}'.`,
                ),
            );
            return;
        }

        const serializer = this.serializationStrategy.get(typeDescriptor.ctor);
        if (serializer !== undefined) {
            return serializer(sourceObject, typeDescriptor, memberName, this, memberOptions, serializerOptions);
        }
        // if not present in the strategy do property by property serialization
        if (typeof sourceObject === 'object') {
            return this.convertAsObject(
                sourceObject,
                typeDescriptor,
                memberName,
                this,
                memberOptions,
                serializerOptions,
            );
        }

        let error = `Could not serialize '${memberName}'; don't know how to serialize type`;

        if (typeDescriptor.hasFriendlyName()) {
            error += ` '${typeDescriptor.ctor.name}'`;
        }

        this.errorHandler(new TypeError(`${error}.`));
    }

    convertAsObject(
        sourceObject: IndexedObject,
        typeDescriptor: ConcreteTypeDescriptor,
        memberName: string,
        serializer: Serializer,
        memberOptions?: ObjectMemberMetadata,
        serializerOptions?: any,
    ) {
        let sourceTypeMetadata: JsonObjectMetadata | undefined;
        let targetObject: IndexedObject;
        let typeHintEmitter = serializer.getTypeHintEmitter();

        if (sourceObject.constructor !== typeDescriptor.ctor && sourceObject instanceof typeDescriptor.ctor) {
            // The source object is not of the expected type, but it is a valid subtype.
            // This is OK, and we'll proceed to gather object metadata from the subtype instead.
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
        } else {
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(typeDescriptor.ctor);
        }

        if (sourceTypeMetadata === undefined) {
            // Untyped serialization, "as-is", we'll just pass the object on.
            // We'll clone the source object, because type hints are added to the object itself, and we
            // don't want to modify
            // to the original object.
            targetObject = { ...sourceObject };
        } else {
            const beforeSerializationMethodName = sourceTypeMetadata.beforeSerializationMethodName;
            if (beforeSerializationMethodName != null) {
                if (typeof (sourceObject as any)[beforeSerializationMethodName] === 'function') {
                    // check for member first
                    (sourceObject as any)[beforeSerializationMethodName]();
                } else if (typeof (sourceObject.constructor as any)[beforeSerializationMethodName] === 'function') {
                    // check for static
                    (sourceObject.constructor as any)[beforeSerializationMethodName]();
                } else {
                    serializer.getErrorHandler()(
                        new TypeError(
                            `beforeSerialization callback '` +
                                `${nameof(sourceTypeMetadata.classType)}.${beforeSerializationMethodName}` +
                                `' is not a method.`,
                        ),
                    );
                }
            }

            const sourceMeta = sourceTypeMetadata;
            // Strong-typed serialization available.
            // We'll serialize by members that have been marked with @jsonMember (including
            // array/set/map members), and perform recursive conversion on each of them. The converted
            // objects are put on the 'targetObject', which is what will be put into 'JSON.stringify'
            // finally.
            targetObject = {};

            const classOptions = mergeOptions(serializer.options, sourceMeta.options);
            if (sourceMeta.typeHintEmitter != null) {
                typeHintEmitter = sourceMeta.typeHintEmitter;
            }

            sourceMeta.dataMembers.forEach((objMemberMetadata) => {
                const objMemberOptions = mergeOptions(classOptions, objMemberMetadata.options);
                let serialized;
                if (objMemberMetadata.serializer != null) {
                    serialized = objMemberMetadata.serializer(sourceObject[objMemberMetadata.key], {
                        fallback: (so, td) => serializer.convertSingleValue(so, ensureTypeDescriptor(td)),
                    });
                } else if (objMemberMetadata.type == null) {
                    throw new TypeError(
                        `Could not serialize ${objMemberMetadata.name}, there is` +
                            ` no constructor nor serialization function to use.`,
                    );
                } else {
                    serialized = serializer.convertSingleValue(
                        sourceObject[objMemberMetadata.key],
                        objMemberMetadata.type(),
                        `${nameof(sourceMeta.classType)}.${objMemberMetadata.key}`,
                        objMemberOptions,
                        serializerOptions,
                    );
                }

                if (
                    (serializer.retrievePreserveNull(objMemberOptions) && serialized === null) ||
                    isValueDefined(serialized)
                ) {
                    targetObject[objMemberMetadata.name] = serialized;
                }
            });
        }

        // Add type-hint.
        typeHintEmitter(targetObject, sourceObject, typeDescriptor.ctor, sourceTypeMetadata);

        return targetObject;
    }
}

export type SerializerFn<T, TD extends TypeDescriptor, Raw> = (
    sourceObject: T,
    typeDescriptor: TD,
    memberName: string,
    serializer: Serializer,
    memberOptions?: ObjectMemberMetadata,
    serializerOptions?: any,
) => Raw;
