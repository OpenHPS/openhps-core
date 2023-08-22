import { expect } from 'chai';
import 'mocha';
import { DataSerializerUtils, RelativeDistance, SerializableMember, SerializableMemberOptions, SerializableObject } from '../../../src';

declare module "../../../src/data/decorators/options" {
    interface MemberOptionsBase {
        abc?: string;
        xyz?: string;
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
            const meta = DataSerializerUtils.getMetadata(obj);
            expect(meta.dataMembers.get('member1').options.abc).to.equal("hello");
            expect((meta.dataMembers.get('member1').options as SerializableMemberOptions).primaryKey).to.equal(true);

            @SerializableObject()
            class TestTest extends Test {

            }
            
            SerializableMember({
                xyz: "abc"
            })(Test.prototype, 'member1');

            const obj2 = new TestTest();
            const meta2 = DataSerializerUtils.getMetadata(obj2);
            expect(meta2.dataMembers.get('member1').options.abc).to.equal("hello");
            expect(meta2.dataMembers.get('member1').options.xyz).to.equal("abc");
            expect((meta2.dataMembers.get('member1').options as SerializableMemberOptions).primaryKey).to.equal(true);

        });
    });

    describe('datamembers' , () => {

        it('should update information', () => {
            const meta = DataSerializerUtils.getOwnMetadata(RelativeDistance);
            const member = meta.dataMembers.get('referenceValue');
            expect(member.type().ctor).to.eql(Number);
        });


        it('should support unintialized types', () => {
            
            @SerializableObject()
            class MyNewClass {
    
            }

            @SerializableObject()
            class MyTestClass {
                @SerializableMember(() => MyNewClass)
                abc: any;
            }
            
        });
    });

});
