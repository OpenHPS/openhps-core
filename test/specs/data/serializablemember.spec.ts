import { expect } from 'chai';
import 'mocha';
import { DataSerializer, SerializableMember, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/SerializableMember" {
    interface SerializableMemberOptions {
        abc?: string;
    }
}

describe('SerializableMember', () => {

    describe('augmentation', () => {
        it('should be able to inject additional options', () => {
            @SerializableObject()
            class Test {
                @SerializableMember({
                    abc: "hello"
                })
                member1: string;
            }
            const obj = new Test();
            const meta = DataSerializer.getRootMetadata(obj);
            expect((meta.dataMembers.get('member1') as any).abc).to.equal("hello");
        });
    });

});
