import { expect } from 'chai';
import 'mocha';
import { DataSerializer, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/options" {
    interface SerializableObjectOptions<T> {
        abc?: string;
        anArray?: string[];
    }
}

describe('SerializableObject', () => {

    describe('registration', () => {
        @SerializableObject({
            abc: "hello"
        })
        class Test {

        }

        it('should be possible to update the options', () => {
            expect(DataSerializer.getMetadata(Test).options.anArray).to.be.undefined;
            SerializableObject({
                anArray: ["abc"]
            })(Test);
            expect(DataSerializer.getMetadata(Test).options.anArray).to.not.undefined;
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
                anArray: ["http://class1"]
            })
            class Class1 {

            }

            @SerializableObject({
                abc: "class2",
                anArray: ["http://class2"]
            })
            class Class2 extends Class1 {

            }
            const obj = new Class2();
            const meta = DataSerializer.getRootMetadata(obj);
            expect(meta.options.abc).to.equal("class2");
            expect(meta.options.anArray.length).to.equal(2);
            expect(meta.options.anArray[0]).to.equal("http://class1");
            expect(meta.options.anArray[1]).to.equal("http://class2");
        });
    });

});