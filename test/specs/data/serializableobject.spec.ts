import { expect } from 'chai';
import 'mocha';
import { DataSerializer, DataSerializerUtils, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/options" {
    interface SerializableObjectOptions<T> {
        abc?: string;
        anArray?: string[];
        nested?: {
            abc?: string;
            anArray?: string[];
            record?: Record<string, string[]>;
        }
    }
}

describe('SerializableObject', () => {

    describe('registration', () => {
        @SerializableObject({
            abc: "hello"
        })
        class Test {

        }

        @SerializableObject({
            
        })
        class TestTest extends Test {

        }

        it('should be possible to update the options', () => {
            expect(DataSerializerUtils.getMetadata(Test).options.anArray).to.be.undefined;
            expect(DataSerializerUtils.getRootMetadata(Test).knownTypes.size).to.equal(2);
            expect(DataSerializerUtils.getMetadata(TestTest).options.anArray).to.be.undefined;
            SerializableObject({
                anArray: ["abc"]
            })(Test);
            expect(DataSerializerUtils.getMetadata(Test).options.anArray).to.not.undefined;
            expect(DataSerializerUtils.getMetadata(TestTest).options.anArray).to.not.be.undefined;
        })
    });

    describe('augmentation', () => {
        it('should be able to inject additional options', () => {
            @SerializableObject({
                abc: "hello"
            })
            class Test {

            }
            const obj = new Test();
            const meta = DataSerializer.getRootMetadata(obj);
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
            const meta = DataSerializer.getMetadata(obj);
            const rootMeta = DataSerializer.getMetadata(Class1);
            
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