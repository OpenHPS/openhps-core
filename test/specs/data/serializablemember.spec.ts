import { expect } from 'chai';
import 'mocha';
import {
    DataSerializer,
    DataSerializerUtils,
    RelativeDistance,
    SerializableMember,
    SerializableMemberOptions,
    SerializableObject,
} from '../../../src';

declare module '../../../src/data/decorators/options' {
    interface MemberOptionsBase {
        abc?: string;
        xyz?: string;
        xxx?: {
            anArray?: string[];
            anotherArray?: string[];
            anArrayOrAtomicValue?: string[] | string;
        };
    }
}

describe('SerializableMember', () => {
    describe('augmentation', () => {
        it('should be able to inject additional members', () => {
            @SerializableObject()
            class Test {
                @SerializableMember({
                    abc: 'hello',
                })
                member1: string;
            }

            interface Test {
                member2: string;
            }

            Test.prototype.member2 = undefined;
            Reflect.defineMetadata('design:type', String, Test.prototype, 'member2');
            SerializableMember({
                abc: 'hello2',
            })(Test.prototype, 'member2');
            const obj = new Test();
            const meta = DataSerializerUtils.getMetadata(obj);
            expect(meta.dataMembers.get('member1').options.abc).to.equal('hello');
            expect(meta.dataMembers.get('member2').options.abc).to.equal('hello2');
        });

        it('should be able to inject additional members in extended classes', () => {
            @SerializableObject()
            class Test {
                @SerializableMember({
                    abc: 'hello',
                })
                member1: string;
            }

            @SerializableObject()
            class Test2 extends Test {}

            interface Test {
                member2: Object;
            }

            Test.prototype.member2 = undefined;
            Reflect.defineMetadata('design:type', Object, Test.prototype, 'member2');
            SerializableMember({
                abc: 'hello2',
            })(Test.prototype, 'member2');
            const obj = new Test();
            const meta = DataSerializerUtils.getMetadata(obj);
            expect(meta.dataMembers.get('member1').options.abc).to.equal('hello');
            expect(meta.dataMembers.get('member2').options.abc).to.equal('hello2');

            const obj2 = new Test2();
            const meta2 = DataSerializerUtils.getMetadata(obj2);
            expect(meta2.dataMembers.get('member1').options.abc).to.equal('hello');
            expect(meta2.dataMembers.get('member2').options.abc).to.equal('hello2');
        });

        it('should be able to inject additional options', () => {
            @SerializableObject()
            class Test {
                @SerializableMember({
                    abc: 'hello',
                })
                member1: string;
            }

            @SerializableObject()
            class Test2 extends Test {}
            const obj = new Test();
            const meta = DataSerializerUtils.getRootMetadata(obj);
            expect(meta.dataMembers.get('member1').options.abc).to.equal('hello');
            const obj2 = new Test2();
            const meta2 = DataSerializerUtils.getRootMetadata(obj2);
            expect(meta2.dataMembers.get('member1').options.abc).to.equal('hello');
        });

        it('should be able to merge injected options', () => {
            @SerializableObject()
            class Test {
                @SerializableMember({
                    primaryKey: true,
                    xxx: {
                        anArray: ['1'],
                        anArrayOrAtomicValue: '1',
                    },
                })
                member1: string;
            }

            SerializableMember({
                abc: 'hello',
                xxx: {
                    anArray: ['2'],
                    anotherArray: ['1'],
                },
            })(Test.prototype, 'member1');

            const obj = new Test();
            const meta = DataSerializerUtils.getMetadata(obj);
            expect(meta.dataMembers.get('member1').options.abc).to.equal('hello');
            expect((meta.dataMembers.get('member1').options as SerializableMemberOptions).primaryKey).to.equal(true);
            expect((meta.dataMembers.get('member1').options as SerializableMemberOptions).xxx.anArray.length).to.equal(
                2,
            );

            @SerializableObject()
            class TestTest extends Test {}

            SerializableMember({
                xyz: 'abc',
                xxx: {
                    anArray: ['3'],
                },
            })(Test.prototype, 'member1');
            SerializableMember({
                xxx: {
                    anArray: ['4'],
                    anArrayOrAtomicValue: '2',
                    anotherArray: ['2'],
                },
            })(TestTest.prototype, 'member1');

            const obj2 = new TestTest();
            const meta2 = DataSerializerUtils.getMetadata(obj2);
            expect(meta2.dataMembers.get('member1').options.abc).to.equal('hello');
            expect(meta2.dataMembers.get('member1').options.xyz).to.equal('abc');
            expect((meta2.dataMembers.get('member1').options as SerializableMemberOptions).primaryKey).to.equal(true);
            expect((meta2.dataMembers.get('member1').options as SerializableMemberOptions).xxx.anArray.length).to.equal(
                4,
            );
            expect(
                (meta2.dataMembers.get('member1').options as SerializableMemberOptions).xxx.anotherArray.length,
            ).to.equal(2);
            expect(
                (meta2.dataMembers.get('member1').options as SerializableMemberOptions).xxx.anArrayOrAtomicValue,
            ).to.equal('2');
        });
    });

    describe('datamembers', () => {
        @SerializableObject()
        class BugA {
            @SerializableMember({})
            x: number;
        }
        @SerializableObject()
        class BugAA extends BugA {
            @SerializableMember({})
            y: number;
        }

        @SerializableObject()
        class BugAB extends BugA {
            @SerializableMember({})
            z: number;
        }

        @SerializableObject()
        class BugAAA extends BugAA {
            @SerializableMember({})
            w: number;
        }

        @SerializableObject()
        class BugABA extends BugAB {
            @SerializableMember({})
            t: number;
        }

        it('should update information', () => {
            const meta = DataSerializerUtils.getOwnMetadata(RelativeDistance);
            const member = meta.dataMembers.get('referenceValue');
            expect(member.type().ctor).to.eql(Number);
        });

        it('should support unintialized types', () => {
            @SerializableObject()
            class MyNewClass {}

            @SerializableObject()
            class MyTestClass {
                @SerializableMember(() => MyNewClass)
                abc: any;
            }
        });

        it('should not update the members of siblings', () => {
            let meta = DataSerializerUtils.getMetadata(BugAB);
            expect(meta.dataMembers.get('y')).to.be.undefined;
            SerializableMember({
                xyz: 'abc',
            })(BugAA.prototype, 'y');
            meta = DataSerializerUtils.getMetadata(BugAB);
            expect(meta.dataMembers.get('y')).to.be.undefined;

            meta = DataSerializerUtils.getMetadata(BugABA);
            expect(meta.dataMembers.get('y')).to.be.undefined;

            SerializableMember({
                xyz: 'abc',
            })(BugAAA.prototype, 'w');

            meta = DataSerializerUtils.getMetadata(BugAB);
            expect(meta.dataMembers.get('y')).to.be.undefined;

            meta = DataSerializerUtils.getMetadata(BugABA);
            expect(meta.dataMembers.get('y')).to.be.undefined;

            meta = DataSerializerUtils.getMetadata(BugAB);
            expect(meta.dataMembers.get('w')).to.be.undefined;

            meta = DataSerializerUtils.getMetadata(BugABA);
            expect(meta.dataMembers.get('w')).to.be.undefined;
        });
    });

    describe('inheritance', () => {
        @SerializableObject()
        class InheritBase {
            @SerializableMember()
            shared: string;
        }

        @SerializableObject()
        class InheritChild extends InheritBase {
            @SerializableMember({ name: 'renamedInChild' })
            shared: string;
        }

        it('should serialize a renamed member once in the sub type', () => {
            const child = new InheritChild();
            child.shared = 'child-value';
            const serialized = DataSerializer.serialize(child);
            expect(serialized['renamedInChild']).to.equal('child-value');
            expect(serialized).to.not.have.property('shared');
        });

        it('should not change the super type when a sub type renames a member', () => {
            const base = new InheritBase();
            base.shared = 'base-value';
            const serialized = DataSerializer.serialize(base);
            expect(serialized['shared']).to.equal('base-value');
            expect(serialized).to.not.have.property('renamedInChild');
        });

        it('should give the sub type its own member metadata', () => {
            const baseMember = DataSerializerUtils.getMetadata(InheritBase).dataMembers.get('shared');
            const childMember = DataSerializerUtils.getMetadata(InheritChild).dataMembers.get('renamedInChild');
            expect(baseMember).to.not.be.undefined;
            expect(childMember).to.not.be.undefined;
            // Sub types inherit the same metadata objects; a member override must detach first,
            // otherwise the merge below rewrites the super type's options too.
            expect(baseMember).to.not.equal(childMember);
            expect((baseMember as any).options?.name).to.not.equal('renamedInChild');
        });

        it('should drop the inherited alias of a renamed member', () => {
            const keys = [...DataSerializerUtils.getMetadata(InheritChild).dataMembers.keys()];
            expect(keys).to.include('renamedInChild');
            expect(keys).to.not.include('shared');
        });
    });
});
