import { expect } from 'chai';
import 'mocha';
import { DataSerializerUtils, SerializableMember, SerializableMemberOptions, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/options" {
    interface MemberOptionsBase {
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

            @SerializableObject()
            class Test2 extends Test {
                
            }
            const obj = new Test();
            const meta = DataSerializerUtils.getRootMetadata(obj);
            expect(meta.dataMembers.get('member1').options.abc).to.equal("hello");
            const obj2 = new Test2();
            const meta2 = DataSerializerUtils.getRootMetadata(obj2);
            expect(meta2.dataMembers.get("member1").options.abc).to.equal("hello");
        });

        it('should be able to merge injected options', () => {
            @SerializableObject()
            class Test {
                @SerializableMember({
                    primaryKey: true
                })
                member1: string;
            }

            SerializableMember({
                abc: "hello"
            })(Test.prototype, 'member1');

            const obj = new Test();
            const meta = DataSerializerUtils.getRootMetadata(obj);
            expect(meta.dataMembers.get('member1').options.abc).to.equal("hello");
            expect((meta.dataMembers.get('member1').options as SerializableMemberOptions).primaryKey).to.equal(true);
        });
    });

});
