import { expect } from 'chai';
import 'mocha';
import {
    DataSerializer,
    DataObject,
    AbsolutePosition,
    DataFrame,
    SerializableObject,
    SerializableMember,
    TimeService,
    SerializableMemberFunction,
    DataSerializerUtils,
    Absolute3DPosition,
    Velocity,
    Orientation,
    AngularVelocityUnit,
    LengthUnit,
    DerivedUnit,
    LinearVelocity,
    LinearVelocityUnit,
    Accuracy2D,
    SensorValue,
    Vector3,
} from '../../../src';
import { BroadcastNode } from '../../../src/nodes/shapes/BroadcastNode';
import { ServiceProxy } from '../../../src/service/_internal';
import { DummyDataFrame } from '../../mock/data/DummyDataFrame';

describe('DataSerializer', () => {
    it('should register and unregister serializable objects', () => {
        DataSerializer.unregisterType(DataObject);
        expect(DataSerializer.findTypeByName('DataObject')).to.equal(undefined);
        DataSerializer.unregisterType(DataObject); // Should not crash
        DataSerializer.registerType(DataObject);
        expect(DataSerializer.findTypeByName('DataObject')).to.equal(DataObject);
    });

    it('should register a new esm type', () => {
        class FloorObject extends DataObject {
            floor: number;
            randomObject: any;
            
            constructor() {
                super();
            }
        }

        DataSerializer.registerType(FloorObject, {
            members: {
                floor: Number,
                randomObject: Object,
            }
        });
        
        console.log(DataSerializerUtils.getOwnMetadata(FloorObject).dataMembers.get('randomObject').type());
        const obj = new FloorObject();
        obj.floor = 1;
        obj.randomObject = new DataObject();
        const serialized = DataSerializer.serialize(obj);
        console.log(serialized);
        const deserialized = DataSerializer.deserialize(serialized);
        // expect(deserialized).to.eql(obj);
    });

    describe('serializing', () => {
        it('should correctly serialize an extended object without decorators', () => {
            @SerializableObject()
            class Bar {
                @SerializableMember({
                    name: "displayName"
                })
                name: string;
            }    

            class Foo extends Bar {
                username: string;
            }

            const obj = new Foo();
            obj.username = "mvdewync";
            obj.name = "Maxim";
            const serialized = DataSerializer. serialize(obj);
            expect(serialized.username).to.be.undefined;
            expect(serialized.displayName).to.not.be.undefined;
        });

        it('should serialize a proxied object', () => {
            const service = new TimeService();
            const proxied = new Proxy(service, new ServiceProxy());
            const serialized = DataSerializer.serialize(proxied);
        });

        it('should support extracting meta info', () => {
            const meta = DataSerializer.getRootMetadata(AbsolutePosition);
            expect(meta.dataMembers).to.not.be.undefined;
        });
        
        it('should not crash on null or undefined objects in an array', () => {
            DataSerializer.deserialize([null, undefined]);
        });

        it('should serialize functions', () => {
            @SerializableObject()
            class Test {
                @SerializableMemberFunction()
                fn = (abc: string) => abc + "_test";
            }
            const obj = new Test();
            const serialized = DataSerializer.serialize(obj);
            const deserialized: Test = DataSerializer.deserialize(serialized);
            expect(deserialized.fn("hello")).to.equal(obj.fn("hello"));
        });

        it('should serialize global types directly', () => {
            class SomeClass {
                abc: string;
            }

            const obj = new SomeClass();
            obj.abc = 'test';

            DataSerializer.registerType(SomeClass, {
                serializer: (obj) => {
                    return {
                        hello: obj.abc,
                    };
                },
                deserializer: (json) => {
                    if (!json) {
                        return undefined;
                    }
                    const obj = new SomeClass();
                    obj.abc = json.hello;
                    return obj;
                },
            });

            const serialized = DataSerializer.serialize(obj);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(obj);
        });

        it('should serialize global types with constructor', () => {
            class SomeClass {
                abc: string;

                constructor(abc: string) {
                    this.abc = abc;
                }
            }

            const obj = new SomeClass('test');

            DataSerializer.registerType(SomeClass, {
                serializer: (obj) => {
                    return {
                        hello: obj.abc,
                    };
                },
                deserializer: (json) => {
                    if (!json) {
                        return undefined;
                    }
                    const obj = new SomeClass(json.hello);
                    return obj;
                },
            });

            const serialized = DataSerializer.serialize(obj);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(obj);
        });

        it('should serialize global types indirectly', () => {
            class SomeClass {
                abc: string;
            }

            const obj = new SomeClass();
            obj.abc = 'test';

            DataSerializer.registerType(SomeClass, {
                serializer: (obj) => {
                    return {
                        hello: obj.abc,
                    };
                },
                deserializer: (json) => {
                    if (!json) {
                        return undefined;
                    }
                    const obj = new SomeClass();
                    obj.abc = json.hello;
                    return obj;
                },
            });

            @SerializableObject()
            class SomeFrame extends DataFrame {
                @SerializableMember()
                obj: SomeClass;
            }

            const frame = new SomeFrame();
            frame.obj = obj;

            const serialized = DataSerializer.serialize(frame);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(frame);
        });

        it('should serialize map members', () => {
            const frame = new DummyDataFrame();
            frame.testMap.set('1', { name: 'one' });
            frame.testMap.set('2', { name: 'two' });
            const serialized = DataSerializer.serialize(frame);
            const deserialized: DummyDataFrame = DataSerializer.deserialize(serialized);
            expect(deserialized.testMap.size).to.equal(2);
        });

        it('should return undefined when serialized data is null', () => {
            expect(DataSerializer.serialize(undefined)).to.equal(undefined);
        });

        it('should serialize arrays', () => {
            const serialized = DataSerializer.serialize([new DataObject(), new DataObject()]);
            expect(serialized).to.be.instanceOf(Array);
            expect(serialized.length).to.equal(2);
        });

        it('should serialize unregistered types', () => {
            DataSerializer.unregisterType(DataObject);
            const serialized = DataSerializer.serialize(new DataObject());
            expect(serialized.__type).to.equal('DataObject');
            DataSerializer.registerType(DataObject);
        });

        it('should throw an error when serializing fails', (done) => {
            const obj = new DataObject();
            (obj as any).createdTimestamp = { test: 'abc' };
            try {
                const serialized = DataSerializer.serialize(obj);
                done('No error thrown! Serialization succeeded ' + JSON.stringify(serialized));
            } catch (ex) {
                done();
            }
        });
    });

    describe('deserializing', () => {
        it('should return undefined when deserialized data is null', () => {
            expect(DataSerializer.deserialize(undefined)).to.equal(undefined);
        });

        it('should deserialize arrays', () => {
            const serialized = DataSerializer.serialize([new DataObject(), new DataObject()]);
            const deserialized = DataSerializer.deserialize(serialized) as DataObject[];
            expect(deserialized).to.be.instanceOf(Array);
            expect(deserialized.length).to.equal(2);
            expect(deserialized[0]).to.be.instanceOf(DataObject);
        });

        it('should deserialize generic types' , () => {
            const velocity = new LinearVelocity(1, 2, 3, LinearVelocityUnit.METER_PER_SECOND);
            velocity.setAccuracy(new Accuracy2D(1, 1, LinearVelocityUnit.CENTIMETER_PER_SECOND));
            const serialized = DataSerializer.serialize(velocity);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(velocity).to.eql(deserialized);
        });

        it('should throw an error when deserializing fails', (done) => {
            const obj = { timestamp: 'abc', __type: 'AbsolutePosition' };
            try {
                const deserialized = DataSerializer.deserialize(obj);
                done('No error thrown! Deserialization succeeded with ' + JSON.stringify(deserialized));
            } catch (ex) {
                done();
            }
        });

        it('should not break knownTypes', () => {
            expect(DataSerializerUtils.getOwnMetadata(Velocity).knownTypes.size).to.eql(1);
            DataSerializer.deserialize(DataSerializer.serialize(new Absolute3DPosition()));
            expect(DataSerializerUtils.getOwnMetadata(Velocity).knownTypes.size).to.eql(1);
            expect(DataSerializerUtils.getOwnMetadata(LengthUnit).knownTypes.size).to.eql(0);
            expect(DataSerializerUtils.getOwnMetadata(DerivedUnit).knownTypes.size).to.eql(3);
            //expect(DataSerializerUtils.getOwnMetadata(SensorValue).knownTypes).to.not.contain(Vector3);
        });
    });
});
