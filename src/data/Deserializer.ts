import { Deserializer as JSONDeserializer } from 'typedjson/lib/cjs/deserializer';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import {
    ensureTypeDescriptor,
    ConcreteTypeDescriptor,
    ArrayTypeDescriptor,
    MapTypeDescriptor,
    SetTypeDescriptor,
} from 'typedjson/lib/cjs/type-descriptor';
import { IndexedObject, JsonObjectMetadata, Serializable, TypeResolver } from 'typedjson';
import { ObjectMemberMetadata } from './decorators/metadata';
import type { OptionsBase } from 'typedjson/lib/types/options-base';
import { mergeOptions } from 'typedjson/lib/cjs/options-base';
import { isSubtypeOf, isValueDefined, nameof } from 'typedjson/lib/cjs/helpers';

export class Deserializer extends JSONDeserializer {
    protected declare options?: OptionsBase;
    protected declare deserializationStrategy: Map<Serializable<any>, DeserializerFn<any, TypeDescriptor, any>>;
    protected errorHandler: (error: Error) => void = (e: Error) => {
        e.message = e.message.replace('@jsonObject', '@SerializableObject()');
        e.message = e.message.replace('@jsonMember', '@SerializableMember()');
        e.message = e.message.replace('@jsonSetMember', '@SerializableSetMember()');
        e.message = e.message.replace('@jsonMapMember', '@SerializableMapMember()');
        e.message = e.message.replace('@jsonArrayMember', '@SerializableArrayMember()');
        throw e;
    };
    protected typeResolver(sourceObject: IndexedObject, knownTypes: Map<string, Serializable<any>>) {
        return sourceObject['__type'] !== undefined
            ? knownTypes.get(sourceObject.__type)
            : sourceObject.constructor ?? Object;
    }
    protected declare nameResolver?: (ctor: Serializable<any>) => string;
    declare setDeserializationStrategy: (
        type: Serializable<any>,
        deserializer: DeserializerFn<any, TypeDescriptor, any>,
    ) => void;
    declare setNameResolver: (nameResolverCallback: (ctor: Serializable<any>) => string) => void;
    declare setTypeResolver: (typeResolverCallback: TypeResolver) => void;
    declare getTypeResolver: () => TypeResolver;
    declare setErrorHandler: (errorHandlerCallback: (error: Error) => void) => void;
    declare getErrorHandler: () => (error: Error) => void;
    declare instantiateType: (ctor: any) => any;
    declare mergeKnownTypes: (
        ...knownTypeMaps: Array<Map<string, Serializable<any>>>
    ) => Map<string, Serializable<any>>;
    declare createKnownTypesMap: (knowTypes: Set<Serializable<any>>) => Map<string, Serializable<any>>;
    declare retrievePreserveNull: (memberOptions?: ObjectMemberMetadata) => boolean;

    constructor() {
        super();
        this.setDeserializationStrategy(Map, this.convertAsMap.bind(this));
        this.setDeserializationStrategy(Array, this.convertAsArray.bind(this));
        this.setDeserializationStrategy(Set, this.convertAsSet.bind(this));
    }

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName?: string,
        memberOptions?: ObjectMemberMetadata,
        serializerOptions?: any,
    ): any {
        return this._convertSingleValue.bind(this)(
            sourceObject,
            typeDescriptor,
            knownTypes,
            memberName,
            memberOptions,
            serializerOptions,
        );
    }

    private _convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName: string,
        memberOptions?: ObjectMemberMetadata,
        serializerOptions?: any,
    ): any {
        if (this.retrievePreserveNull(memberOptions) && sourceObject === null) {
            return null;
        } else if (!isValueDefined(sourceObject)) {
            return;
        }

        const deserializer = this.deserializationStrategy.get(typeDescriptor.ctor);
        if (deserializer !== undefined) {
            return deserializer(
                sourceObject,
                typeDescriptor,
                knownTypes,
                memberName,
                this,
                memberOptions,
                serializerOptions,
            );
        }

        if (typeof sourceObject === 'object') {
            return this.convertAsObject(
                sourceObject,
                typeDescriptor,
                knownTypes,
                memberName,
                this,
                memberOptions,
                serializerOptions,
            );
        }

        let error = `Could not deserialize '${memberName}'; don't know how to deserialize type`;

        if (typeDescriptor.hasFriendlyName()) {
            error += ` '${typeDescriptor.ctor.name}'`;
        }

        this.errorHandler(new TypeError(`${error}.`));
    }

    convertAsObject<T>(
        sourceObject: IndexedObject,
        typeDescriptor: ConcreteTypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName: string,
        deserializer: Deserializer,
        memberOptions?: ObjectMemberMetadata,
        serializerOptions?: any,
    ): IndexedObject | T | undefined {
        if ((typeof sourceObject as any) !== 'object' || (sourceObject as any) === null) {
            deserializer.getErrorHandler()(
                new TypeError(`Cannot deserialize ${memberName}: 'sourceObject' must be a defined object.`),
            );
            return undefined;
        }

        let expectedSelfType = typeDescriptor.ctor;
        let sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(expectedSelfType);
        let knownTypeConstructors = knownTypes;
        let typeResolver = deserializer.getTypeResolver();

        if (sourceObjectMetadata !== undefined) {
            // Merge known types received from "above" with known types defined on the current type.
            knownTypeConstructors = deserializer.mergeKnownTypes(
                knownTypeConstructors,
                deserializer.createKnownTypesMap(sourceObjectMetadata.knownTypes),
            );
            if (sourceObjectMetadata.typeResolver != null) {
                typeResolver = sourceObjectMetadata.typeResolver;
            }
        }

        // Check if a type-hint is available from the source object.
        const typeFromTypeHint = typeResolver(sourceObject, knownTypeConstructors);

        if (typeFromTypeHint != null) {
            // Check if type hint is a valid subtype of the expected source type.
            if (isSubtypeOf(typeFromTypeHint, expectedSelfType)) {
                // Hell yes.
                expectedSelfType = typeFromTypeHint;
                sourceObjectMetadata = JsonObjectMetadata.getFromConstructor(typeFromTypeHint);

                if (sourceObjectMetadata !== undefined) {
                    // Also merge new known types from subtype.
                    knownTypeConstructors = deserializer.mergeKnownTypes(
                        knownTypeConstructors,
                        deserializer.createKnownTypesMap(sourceObjectMetadata.knownTypes),
                    );
                }
            }
        }

        if (sourceObjectMetadata?.isExplicitlyMarked === true) {
            const sourceMetadata = sourceObjectMetadata;
            // Strong-typed deserialization available, get to it.
            // First deserialize properties into a temporary object.
            const sourceObjectWithDeserializedProperties = {} as IndexedObject;

            const classOptions = mergeOptions(deserializer.options, sourceMetadata.options);

            // Deserialize by expected properties.
            sourceMetadata.dataMembers.forEach((objMemberMetadata, propKey) => {
                const objMemberValue = sourceObject[propKey];
                const objMemberDebugName = `${nameof(sourceMetadata.classType)}.${propKey}`;
                const objMemberOptions = mergeOptions(classOptions, objMemberMetadata.options);

                let revivedValue;
                if (objMemberMetadata.deserializer != null) {
                    revivedValue = objMemberMetadata.deserializer(objMemberValue, {
                        fallback: (so, td) => deserializer.convertSingleValue(so, ensureTypeDescriptor(td), knownTypes),
                    });
                } else if (objMemberMetadata.type == null) {
                    throw new TypeError(
                        `Cannot deserialize ${objMemberDebugName} there is` +
                            ` no constructor nor deserialization function to use.`,
                    );
                } else {
                    revivedValue = deserializer.convertSingleValue(
                        objMemberValue,
                        objMemberMetadata.type(),
                        knownTypeConstructors,
                        objMemberDebugName,
                        objMemberOptions,
                        serializerOptions,
                    );
                }

                // @todo revivedValue will never be null in RHS of ||
                if (
                    isValueDefined(revivedValue) ||
                    (deserializer.retrievePreserveNull(objMemberOptions) && (revivedValue as any) === null)
                ) {
                    sourceObjectWithDeserializedProperties[objMemberMetadata.key] = revivedValue;
                } else if (objMemberMetadata.isRequired === true) {
                    deserializer.getErrorHandler()(new TypeError(`Missing required member '${objMemberDebugName}'.`));
                }
            });

            // Next, instantiate target object.
            let targetObject: IndexedObject;

            if (typeof sourceObjectMetadata.initializerCallback === 'function') {
                try {
                    targetObject = sourceObjectMetadata.initializerCallback(
                        sourceObjectWithDeserializedProperties,
                        sourceObject,
                    );

                    // Check the validity of user-defined initializer callback.
                    if ((targetObject as any) == null) {
                        throw new TypeError(
                            `Cannot deserialize ${memberName}:` +
                                ` 'initializer' function returned undefined/null` +
                                `, but '${nameof(sourceObjectMetadata.classType)}' was expected.`,
                        );
                    } else if (!(targetObject instanceof sourceObjectMetadata.classType)) {
                        throw new TypeError(
                            `Cannot deserialize ${memberName}:` +
                                `'initializer' returned '${nameof(targetObject.constructor)}'` +
                                `, but '${nameof(sourceObjectMetadata.classType)}' was expected` +
                                `, and '${nameof(targetObject.constructor)}' is not a subtype of` +
                                ` '${nameof(sourceObjectMetadata.classType)}'`,
                        );
                    }
                } catch (e) {
                    deserializer.getErrorHandler()(e);
                    return undefined;
                }
            } else {
                targetObject = deserializer.instantiateType(expectedSelfType);
            }

            // Finally, assign deserialized properties to target object.
            Object.assign(targetObject, sourceObjectWithDeserializedProperties);

            // Call onDeserialized method (if any).
            const methodName = sourceObjectMetadata.onDeserializedMethodName;
            if (methodName != null) {
                if (typeof (targetObject as any)[methodName] === 'function') {
                    // check for member first
                    (targetObject as any)[methodName]();
                } else if (typeof (targetObject.constructor as any)[methodName] === 'function') {
                    // check for static
                    (targetObject.constructor as any)[methodName]();
                } else {
                    deserializer.getErrorHandler()(
                        new TypeError(
                            `onDeserialized callback` +
                                `'${nameof(sourceObjectMetadata.classType)}.${methodName}' is not a method.`,
                        ),
                    );
                }
            }

            return targetObject;
        } else {
            // Untyped deserialization into Object instance.
            const targetObject = {} as IndexedObject;

            Object.keys(sourceObject).forEach((sourceKey) => {
                targetObject[sourceKey] = deserializer.convertSingleValue(
                    sourceObject[sourceKey],
                    new ConcreteTypeDescriptor(sourceObject[sourceKey].constructor),
                    knownTypes,
                    sourceKey,
                    memberOptions,
                    serializerOptions,
                );
            });

            return targetObject;
        }
    }

    convertAsArray(
        sourceObject: any,
        typeDescriptor: ArrayTypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName: string,
        deserializer: Deserializer,
        memberOptions?: ObjectMemberMetadata,
        serializableOptions?: any,
    ): Array<any> {
        if (!(typeDescriptor instanceof ArrayTypeDescriptor)) {
            throw new TypeError(
                `Could not deserialize ${memberName} as Array: incorrect TypeDescriptor detected,` +
                    ' please use proper annotation or function for this type',
            );
        }
        if (!Array.isArray(sourceObject)) {
            deserializer.getErrorHandler()(
                new TypeError(this.makeTypeErrorMessage(Array, sourceObject.constructor, memberName)),
            );
            return [];
        }

        if ((typeDescriptor.elementType as any) == null) {
            deserializer.getErrorHandler()(
                new TypeError(
                    `Could not deserialize ${memberName} as Array: missing constructor reference of` +
                        ` Array elements.`,
                ),
            );
            return [];
        }

        return sourceObject.map((element, i) => {
            // If an array element fails to deserialize, substitute with undefined. This is so that the
            // original ordering is not interrupted by faulty
            // entries, as an Array is ordered.
            try {
                return deserializer.convertSingleValue(
                    element,
                    typeDescriptor.elementType,
                    knownTypes,
                    `${memberName}[${i}]`,
                    memberOptions,
                    serializableOptions,
                );
            } catch (e) {
                deserializer.getErrorHandler()(e);

                // Keep filling the array here with undefined to keep original ordering.
                // Note: this is just aesthetics, not returning anything produces the same result.
                return undefined;
            }
        });
    }

    convertAsSet(
        sourceObject: any,
        typeDescriptor: SetTypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName: string,
        deserializer: Deserializer,
        memberOptions?: ObjectMemberMetadata,
        serializableOptions?: any,
    ): Set<any> {
        if (!(typeDescriptor instanceof SetTypeDescriptor)) {
            throw new TypeError(
                `Could not deserialize ${memberName} as Set: incorrect TypeDescriptor detected,` +
                    ` please use proper annotation or function for this type`,
            );
        }
        if (!Array.isArray(sourceObject)) {
            deserializer.getErrorHandler()(
                new TypeError(this.makeTypeErrorMessage(Array, sourceObject.constructor, memberName)),
            );
            return new Set<any>();
        }

        if ((typeDescriptor.elementType as any) == null) {
            deserializer.getErrorHandler()(
                new TypeError(
                    `Could not deserialize ${memberName} as Set: missing constructor reference of` + ` Set elements.`,
                ),
            );
            return new Set<any>();
        }

        const resultSet = new Set<any>();

        sourceObject.forEach((element, i) => {
            try {
                resultSet.add(
                    deserializer.convertSingleValue(
                        element,
                        typeDescriptor.elementType,
                        knownTypes,
                        `${memberName}[${i}]`,
                        memberOptions,
                        serializableOptions,
                    ),
                );
            } catch (e) {
                // Faulty entries are skipped, because a Set is not ordered, and skipping an entry
                // does not affect others.
                deserializer.getErrorHandler()(e);
            }
        });

        return resultSet;
    }

    convertAsMap(
        sourceObject: any,
        typeDescriptor: MapTypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName: string,
        deserializer: Deserializer,
        memberOptions?: ObjectMemberMetadata,
        serializableOptions?: any,
    ): Map<any, any> {
        if (!(typeDescriptor instanceof MapTypeDescriptor)) {
            throw new TypeError(
                `Could not deserialize ${memberName} as Map: incorrect TypeDescriptor detected,` +
                    'please use proper annotation or function for this type',
            );
        }
        const expectedShape = typeDescriptor.getCompleteOptions().shape;
        if (!this.isExpectedMapShape(sourceObject, expectedShape)) {
            const expectedType = expectedShape === 0 ? Array : Object;
            deserializer.getErrorHandler()(
                new TypeError(this.makeTypeErrorMessage(expectedType, sourceObject.constructor, memberName)),
            );
            return new Map<any, any>();
        }

        if ((typeDescriptor.keyType as any) == null) {
            deserializer.getErrorHandler()(
                new TypeError(`Could not deserialize ${memberName} as Map: missing key constructor.`),
            );
            return new Map<any, any>();
        }

        if ((typeDescriptor.valueType as any) == null) {
            deserializer.getErrorHandler()(
                new TypeError(`Could not deserialize ${memberName} as Map: missing value constructor.`),
            );
            return new Map<any, any>();
        }

        const keyMemberName = `${memberName}[].key`;
        const valueMemberName = `${memberName}[].value`;
        const resultMap = new Map<any, any>();

        if (expectedShape.name === 'OBJECT') {
            Object.keys(sourceObject).forEach((key) => {
                try {
                    const resultKey = deserializer.convertSingleValue(
                        key,
                        typeDescriptor.keyType,
                        knownTypes,
                        keyMemberName,
                        memberOptions,
                        serializableOptions,
                    );
                    if (isValueDefined(resultKey)) {
                        resultMap.set(
                            resultKey,
                            deserializer.convertSingleValue(
                                sourceObject[key],
                                typeDescriptor.valueType,
                                knownTypes,
                                valueMemberName,
                                memberOptions,
                                serializableOptions,
                            ),
                        );
                    }
                } catch (e) {
                    // Faulty entries are skipped, because a Map is not ordered,
                    // and skipping an entry does not affect others.
                    deserializer.getErrorHandler()(e);
                }
            });
        } else {
            sourceObject.forEach((element: any) => {
                try {
                    const key = deserializer.convertSingleValue(
                        element.key,
                        typeDescriptor.keyType,
                        knownTypes,
                        keyMemberName,
                        memberOptions,
                        serializableOptions,
                    );

                    // Undefined/null keys not supported, skip if so.
                    if (isValueDefined(key)) {
                        resultMap.set(
                            key,
                            deserializer.convertSingleValue(
                                element.value,
                                typeDescriptor.valueType,
                                knownTypes,
                                valueMemberName,
                                memberOptions,
                                serializableOptions,
                            ),
                        );
                    }
                } catch (e) {
                    // Faulty entries are skipped, because a Map is not ordered,
                    // and skipping an entry does not affect others.
                    deserializer.getErrorHandler()(e);
                }
            });
        }

        return resultMap;
    }

    protected isExpectedMapShape(source: any, expectedShape: any): boolean {
        return (expectedShape === 0 && Array.isArray(source)) || (expectedShape === 1 && typeof source === 'object');
    }

    protected makeTypeErrorMessage(
        expectedType: Serializable<any> | string,
        actualType: Serializable<any> | string,
        memberName: string,
    ) {
        const expectedTypeName = typeof expectedType === 'function' ? nameof(expectedType) : expectedType;
        const actualTypeName = typeof actualType === 'function' ? nameof(actualType) : actualType;

        return `Could not deserialize ${memberName}: expected '${expectedTypeName}',` + ` got '${actualTypeName}'.`;
    }
}

export type DeserializerFn<T, TD extends TypeDescriptor, Raw> = (
    sourceObject: Raw,
    typeDescriptor: TD,
    knownTypes: Map<string, Serializable<any>>,
    memberName: string,
    deserializer: Deserializer,
    memberOptions?: ObjectMemberMetadata,
    serializerOptions?: any,
) => T;
