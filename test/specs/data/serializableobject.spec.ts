import { expect } from 'chai';
import 'mocha';
import { DataSerializer, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/options" {
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
            const meta = DataSerializer.getRootMetadata(obj);
            expect(meta.options.abc).to.equal("hello");
        });
    });

});