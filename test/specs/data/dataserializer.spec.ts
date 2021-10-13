import { expect } from 'chai';
import 'mocha';
import { DataSerializer, DataObject, AbsolutePosition } from '../../../src';
import { DummyDataFrame } from '../../mock/data/DummyDataFrame';

describe('DataSerializer', () => {
    it('should register and unregister serializable objects', () => {
        DataSerializer.unregisterType(DataObject);
        expect(DataSerializer.findTypeByName('DataObject')).to.equal(undefined);
        DataSerializer.unregisterType(DataObject); // Should not crash
        expect(DataSerializer.serializableTypes.length).to.be.greaterThan(40);
        DataSerializer.registerType(DataObject);
        expect(DataSerializer.findTypeByName('DataObject')).to.equal(DataObject);
    });

    describe('serializing', () => {
        it('should support extracting meta info', () => {
            const meta = DataSerializer.findRootMetaInfo(AbsolutePosition);
            expect(meta.dataMembers).to.not.be.undefined;
        });

        it('should serialize global types', () => {
            class SomeClass {
                abc: string;
            };

            const obj = new SomeClass();
            obj.abc = "test";

            DataSerializer.registerType(SomeClass, {
                serializer: (obj) => {
                    return {
                        hello: obj.abc
                    };
                },
                deserializer: (json) => {
                    if (!json) {
                        return undefined;
                    }
                    const obj = new SomeClass();
                    obj.abc = json.hello;
                    return obj;
                }
            });

            const serialized = DataSerializer.serialize(obj);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(obj);
        });

        it('should serialize map members', () => {
            const frame = new DummyDataFrame();
            frame.testMap.set("1", { name: "one" });
            frame.testMap.set("2", { name: "two" });
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
            (obj as any).createdTimestamp = { test: "abc" };
            try {
                DataSerializer.serialize(obj);
                done('No error thrown!');
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

        it('should throw an error when deserializing fails', (done) => {
            const obj = { test: "abc" }
            try {
                DataSerializer.deserialize(obj);
                done('No error thrown!');
            } catch (ex) {
                done();
            }
        });
    });
});
