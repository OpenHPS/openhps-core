import { expect } from 'chai';
import 'mocha';
import { Acceleration, DataObject, DataSerializerUtils, Orientation, ReferenceSpace, SensorObject, SensorValue, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/options" {
    interface SerializableObjectOptions<T> {
        abc?: string;
        anArray?: string[];
        nested?: {
            abc?: string;
            anArray?: string[];
            record?: Record<string, string[]>;
            override?: string;
        },
    }
}

describe('SerializableObject', () => {

    describe('registration', () => {
        @SerializableObject({
            abc: "hello",
            nested: {
                override: "test",
                anArray: ["1"]
            }
        })
        class Test {

        }

        @SerializableObject({
            nested: {
                override: "testtest",
                anArray: ["2"]
            }
        })
        class TestTest extends Test {

        }

        @SerializableObject({
            nested: {
                override: "testabc",
                anArray: ["3"]
            }
        })
        class TestAbc extends Test {

        }

        it('should correct register on non-root objects', () => {
            SerializableObject({
                anArray: ["abc"]
            })(Orientation);
            expect(DataSerializerUtils.getMetadata(Orientation).options.anArray).to.not.be.undefined;
        });

        it('should be possible to update the options', () => {
            expect(DataSerializerUtils.getMetadata(Test).options.anArray).to.be.undefined;
            expect(DataSerializerUtils.getRootMetadata(Test).knownTypes.size).to.equal(3);
            expect(DataSerializerUtils.getMetadata(Test).options.nested.override).to.equal("test");
            expect(DataSerializerUtils.getMetadata(TestAbc).options.nested.override).to.equal("testabc");
            expect(DataSerializerUtils.getMetadata(TestTest).options.nested.override).to.equal("testtest");
            expect(DataSerializerUtils.getMetadata(TestTest).options.anArray).to.be.undefined;
            expect(DataSerializerUtils.getMetadata(Test).options.nested.anArray.length).to.equal(1);
            expect(DataSerializerUtils.getMetadata(TestTest).options.nested.anArray.length).to.equal(2);
            expect(DataSerializerUtils.getMetadata(TestAbc).options.nested.anArray.length).to.equal(2);
            SerializableObject({
                anArray: ["abc"],
                nested: {
                    anArray: ["4"]
                }
            })(Test);
            console.log((DataSerializerUtils.getMetadata(Test).options.nested.anArray));
            console.log((DataSerializerUtils.getMetadata(TestAbc).options.nested.anArray));
            console.log((DataSerializerUtils.getMetadata(TestTest).options.nested.anArray));
            expect(DataSerializerUtils.getMetadata(Test).options.anArray).to.not.undefined;
            expect(DataSerializerUtils.getMetadata(TestTest).options.anArray).to.not.be.undefined;
            expect(DataSerializerUtils.getMetadata(Test).options.anArray.length).to.equal(1);
            expect(DataSerializerUtils.getMetadata(Test).options.nested.anArray.length).to.equal(2);
            expect(DataSerializerUtils.getMetadata(TestTest).options.nested.anArray.length).to.equal(3);
            expect(DataSerializerUtils.getMetadata(TestAbc).options.nested.anArray.length).to.equal(3);

            SerializableObject({
                anArray: ["123"],
                nested: {
                    anArray: ["5"]
                }
            })(TestAbc);
            expect(DataSerializerUtils.getMetadata(TestAbc).options.anArray).to.not.undefined;
            expect(DataSerializerUtils.getMetadata(TestTest).options.anArray.length).to.equal(1);
            expect(DataSerializerUtils.getMetadata(TestAbc).options.anArray.length).to.equal(2);
            expect(DataSerializerUtils.getMetadata(Test).options.nested.anArray.length).to.equal(2);
            expect(DataSerializerUtils.getMetadata(TestTest).options.nested.anArray.length).to.equal(3);
            expect(DataSerializerUtils.getMetadata(TestAbc).options.nested.anArray.length).to.equal(4);
        })
    });

    describe('augmentation', () => {

        it('should augment a super class of a vector', () => {
            SerializableObject({
                anArray: ["123"],
            })(SensorValue);
            expect(DataSerializerUtils.getMetadata(Acceleration).options.anArray).to.not.undefined;
        });

        it('should not augment subclasses of the root', () => {
            SerializableObject({
                nested: {
                    anArray: [],
                }
            })(DataObject);
            SerializableObject({
                nested: {
                    anArray: ["sensor"],
                }
            })(SensorObject);
            expect(DataSerializerUtils.getMetadata(DataObject).options.nested.anArray.length).to.equal(0);
            expect(DataSerializerUtils.getMetadata(ReferenceSpace).options.nested.anArray.length).to.equal(0);
            expect(DataSerializerUtils.getMetadata(SensorObject).options.nested.anArray.length).to.equal(1);
        });

        it('should be able to inject additional options', () => {
            @SerializableObject({
                abc: "hello"
            })
            class Test {

            }
            const obj = new Test();
            const meta = DataSerializerUtils.getMetadata(obj);
            expect(meta.options.abc).to.equal("hello");
        });

        it('should be able to deep merge options', () => {
            @SerializableObject({
                abc: "class1",
                anArray: ["http://class1"],
                nested: {
                    abc: "class1",
                    anArray: ["http://class1"],
                    record: {
                        abc: ['class1']
                    }
                }
            })
            class Class1 {

            }

            @SerializableObject({
                abc: "class2",
                anArray: ["http://class2"],
                nested: {
                    abc: "class2",
                    anArray: ["http://class2"],
                    record: {
                        abc: ['class2']
                    }
                }
            })
            class Class2 extends Class1 {

            }
            const obj = new Class2();
            const meta = DataSerializerUtils.getMetadata(obj);
            const rootMeta = DataSerializerUtils.getMetadata(Class1);
            
            expect(meta.options.abc).to.equal("class2");
            expect(meta.options.anArray.length).to.equal(2);
            expect(meta.options.anArray[1]).to.equal("http://class1");
            expect(meta.options.anArray[0]).to.equal("http://class2");

            expect(meta.options.nested.abc).to.equal("class2");
            expect(meta.options.nested.anArray.length).to.equal(2);
            expect(meta.options.nested.anArray[1]).to.equal("http://class1");
            expect(meta.options.nested.anArray[0]).to.equal("http://class2");
            expect(meta.options.nested.record['abc'].length).to.equal(2);

            expect(rootMeta.options.abc).to.equal("class1");
            expect(rootMeta.options.anArray.length).to.equal(1);
            expect(rootMeta.options.anArray[0]).to.equal("http://class1");

            expect(rootMeta.options.nested.abc).to.equal("class1");
            expect(rootMeta.options.nested.anArray.length).to.equal(1);
            expect(rootMeta.options.nested.anArray[0]).to.equal("http://class1");
            expect(rootMeta.options.nested.record['abc'].length).to.equal(1);
        });
    });

});