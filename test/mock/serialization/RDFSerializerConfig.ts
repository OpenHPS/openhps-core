import { DataSerializerConfig, IndexedObject, JsonObjectMetadata, MappedTypeConverters, OptionsBase, Serializer, TypeDescriptor } from "../../../src";
import { RDFLiteral, RDFSubject } from "./rdf";

export class RDFSerializerConfig implements DataSerializerConfig {
    private constructor() {

    }

    typeHintEmitter(
        targetObject: IndexedObject,
        sourceObject: IndexedObject,
        expectedSourceType: Function,
        sourceTypeMetadata?: JsonObjectMetadata,
    ) {
        if (sourceObject['uri'] !== undefined) {
            targetObject.uri = sourceObject['uri'];
        }
    }

    get mappedTypes(): Map<Function, MappedTypeConverters<any>> {
        return new Map<Function, MappedTypeConverters<any>>([
            [Number, { serializer: this.serializeLiteral }],
            [String, { serializer: this.serializeLiteral }],
            [Boolean, { serializer: this.serializeLiteral }]
        ]);
    }

    serializeLiteral(object: any): RDFLiteral[] {
        return [{
            termType: 'Literal',
            value: object,
            dataType: `xsd:${typeof object}`
        }];
    }

    deserializeLiteral(object: any): any {

    }

    serializeObject<T, TD extends TypeDescriptor>(
        sourceObject: T,
        typeDescriptor: TD,
        memberName: string,
        serializer: Serializer,
        memberOptions?: OptionsBase,
    ): RDFSubject {
        const subject = {
            uri: '_:',
            predicates: {
                'rdf:type': [{
                    termType: 'NamedNode',
                    value: `http://example.org/object#${typeDescriptor.ctor.name}`
                }]
            }
        } as RDFSubject;
        let sourceTypeMetadata: JsonObjectMetadata | undefined;
    
        if (sourceObject.constructor !== typeDescriptor.ctor
            && sourceObject instanceof typeDescriptor.ctor) {
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(sourceObject.constructor);
        } else {
            sourceTypeMetadata = JsonObjectMetadata.getFromConstructor(typeDescriptor.ctor);
        }

        sourceTypeMetadata.dataMembers.forEach(member => {
            let object = serializer.convertSingleValue(
                sourceObject[member.key],
                member.type(),
                `${member.name}`,
                member as OptionsBase,
            );
            if (object) {
                subject.predicates[`http://example.org/predicate#${member.name}`] = object;
            }
        });
        return subject;
    }

    static get(): DataSerializerConfig {
        const config = new RDFSerializerConfig();
        return {
            typeHintEmitter: config.typeHintEmitter,
            mappedTypes: config.mappedTypes,
            serializer: config.serializeObject
        };
    }
}
