import { expect } from 'chai';
import 'mocha';
import { DataSerializer, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/SerializableObject" {
    interface SerializableObjectOptions<T> {
        abc?: string;
    }
}

describe('SerializableObject', () => {

    describe('augmentation', () => {
        it('should be able to inject additional options', () => {
            @SerializableObject({
                abc: "hello"
            })
            class Test {

            }
            const obj = new Test();
            const meta = DataSerializer.findRootMetaInfo(obj);
            expect((meta as any).abc).to.equal("hello");
        });
    });

});