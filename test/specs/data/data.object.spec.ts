import { expect } from 'chai';
import 'mocha';
import {
    DataSerializer,
    DataObject,
    RelativeDistance,
    ModelBuilder,
    CallbackNode,
    DataFrame,
    Absolute2DPosition,
    CallbackSinkNode,
    LinearVelocity,
    Model,
    Absolute3DPosition,
    SerializableMember,
    createChangeLog,
    CHANGELOG_METADATA_KEY,
    SerializableObject,
    SerializableMapMember,
    GeographicalPosition,
} from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';

declare module '../../../src/data/object/DataObject' {
    interface DataObject {
        _test: string;
        _testfn: () => string;
    }
}

describe('DataObject', () => {
    describe('augmentation', () => {
        it('should support property augmentation', () => {
            const object = new DataObject();
            object._test = 'abc';
            expect(object._test).to.equal('abc');
        });

        it('should support function augmentation', () => {
            const object = new DataObject();
            expect(object._testfn).to.be.undefined;
            DataObject.prototype._testfn = function () {
                return '123';
            };
            expect(object._testfn()).to.equal('123');
        });

        it('should support applying decorators externally', () => {
            const object = new DataObject();
            object._test = 'abc';
            object.uid = 'TestUID';
            let serialized = DataSerializer.serialize(object);
            expect(serialized.uid).to.equal('TestUID');
            expect(serialized._test).to.be.undefined;
            SerializableMember(String)(DataObject.prototype, '_test');
            serialized = DataSerializer.serialize(object);
            expect(serialized._test).to.equal('abc');
        });
    });

    it('should have a uuidv4 uid', (done) => {
        const obj = new DataObject();
        expect(obj.uid).to.include('-');
        done();
    });

    it('should be serializable and deserializable', (done) => {
        const dataObject = new DataObject('123');
        dataObject.displayName = 'abc';
        dataObject.setPosition(new Absolute3DPosition(2, 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_a'), 1));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_b'), 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_c'), 3));
        const serialized = DataSerializer.serialize(dataObject);
        const deserialized = DataSerializer.deserialize(serialized, DataObject);
        expect(dataObject.uid).to.equal(deserialized.uid);
        expect(dataObject.displayName).to.equal(deserialized.displayName);
        expect(deserialized.position).to.be.instanceOf(Absolute3DPosition);
        done();
    });

    it('should deserialize undefined relative positions', (done) => {
        const dataObject = new DataObject('123');
        dataObject.displayName = 'abc';
        dataObject.setPosition(new Absolute2DPosition(2, 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_a'), 1));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_b'), 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_c'), 3));
        const serialized = DataSerializer.serialize(dataObject);
        serialized.relativePositions = undefined;
        const deserialized = DataSerializer.deserialize(serialized, DataObject);
        expect(dataObject.uid).to.equal(deserialized.uid);
        expect(dataObject.displayName).to.equal(deserialized.displayName);
        expect(deserialized.relativePositions.length).to.equal(0);
        done();
    });

    it('should deserialize relative positions wihout a type', (done) => {
        const dataObject = new DataObject('123');
        dataObject.displayName = 'abc';
        dataObject.setPosition(new Absolute2DPosition(2, 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_a'), 1));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_b'), 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_c'), 3));
        const serialized = DataSerializer.serialize(dataObject);
        serialized.relativePositions = serialized.relativePositions.map((r) => {
            r.__type = undefined;
        });
        const deserialized = DataSerializer.deserialize(serialized, DataObject);
        expect(dataObject.uid).to.equal(deserialized.uid);
        expect(dataObject.displayName).to.equal(deserialized.displayName);
        expect(deserialized.relativePositions.length).to.equal(0);
        done();
    });

    it('should clone', () => {
        const dataObject = new DataObject('123');
        dataObject.displayName = 'abc';
        dataObject.setPosition(new Absolute2DPosition(2, 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_a'), 1));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_b'), 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_c'), 3));
        const clone = dataObject.clone();
        dataObject.displayName = '123';
        dataObject.getPosition().linearVelocity = new LinearVelocity(10, 0);
        expect(clone.displayName).to.equal('abc');
        expect(clone.getPosition()).to.not.be.undefined;
    });

    it('should clone to a super type', () => {
        const dataObject = new DataObject('123');
        dataObject.displayName = 'abc';
        dataObject.setPosition(new Absolute2DPosition(2, 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_a'), 1));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_b'), 2));
        dataObject.addRelativePosition(new RelativeDistance(new DataObject('ref_c'), 3));
        const clone = dataObject.clone(DummySensorObject);
        dataObject.displayName = '123';
        dataObject.getPosition().linearVelocity = new LinearVelocity(10, 0);
        expect(clone.displayName).to.equal('abc');
        expect(clone.getPosition()).to.not.be.undefined;
        expect(clone).to.be.instanceOf(DummySensorObject);
    });

    it('should support listeners', (done) => {
        const dataObject = new DataObject('123');
        ModelBuilder.create()
            .from()
            .via(
                new CallbackNode((frame) => {
                    frame.source.displayName = 'maxim';
                }),
            )
            .to(new CallbackSinkNode())
            .build()
            .then((model: Model) => {
                model.findDataService(DataObject).on('insert', (uid, obj) => {
                    expect(obj.displayName).to.eq('maxim');
                    done();
                });
                model.push(new DataFrame(dataObject));
            })
            .catch(done);
    });

    describe('binding', () => {
        it('should support saving', (done) => {
            ModelBuilder.create()
                .from()
                .to()
                .build()
                .then((model: Model) => {
                    const object = new DataObject('mvdewync', 'Maxim');
                    object
                        .bind(model.findDataService(object))
                        .save()
                        .then(() => {
                            done();
                        })
                        .catch(done);
                });
        });

        it('should support saving with changes', (done) => {
            ModelBuilder.create()
                .from()
                .to()
                .build()
                .then((model: Model) => {
                    const object = new DataObject('mvdewync', 'Maxim');
                    const binding = object.bind(model.findDataService(object));
                    object.uid += '1';
                    binding.on('update', (newObj, oldObj) => {});
                    binding
                        .save()
                        .then(() => {
                            done();
                        })
                        .catch(done);
                });
        });

        describe('sensor object', () => {
            it('should be serializable and deserializable', (done) => {
                const dataObject = new DummySensorObject('123');
                dataObject.displayName = 'abc';
                dataObject.horizontalFOV = 15;
                const serialized = DataSerializer.serialize(dataObject);
                const deserialized = DataSerializer.deserialize(serialized, DummySensorObject);
                expect(dataObject.uid).to.equal(deserialized.uid);
                expect(dataObject.displayName).to.equal(deserialized.displayName);
                expect(dataObject.horizontalFOV).to.equal(15);
                done();
            });
        });
    });

    it('should support conversion to sql', () => {
        const type = DataObject;
        const meta = DataSerializer.findRootMetaInfo(type);
        const members = [];
        meta.dataMembers.forEach((value, key) => {
            members.push(`${key.toLowerCase()}`);
        });
        const sql = `
            CREATE TABLE ${type.name.toLowerCase()} (
                
            );
        `;
    });

    it('should support multiple positions', () => {
        const object = new DataObject('test');
    });

    describe('changelog', () => {
        it('should keep a changelog', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim Van de Wynckel';
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
        });

        it('should filter changes that do not modify the initial state', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim Van de Wynckel';
            objectWithChangelog.displayName = 'Maxim';
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(0);
        });

        it('should not log changes that do not modify the value', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim';
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(0);
        });

        it('should get the latest changes', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim1';
            objectWithChangelog.displayName = 'Maxim2';
            objectWithChangelog.displayName = 'Maxim3';
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges()[0].newValue).to.equal('Maxim3');
        });

        it('should create a changelog for subobjects', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim Van de Wynckel';
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
            (objectWithChangelog.position as Absolute2DPosition).x = 10;
            expect(objectWithChangelog.position[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
        });

        it('should merge changes', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim1';
            objectWithChangelog.displayName = 'Maxim2';
            objectWithChangelog.displayName = undefined;
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges()[0].oldValue).to.equal('Maxim');
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges()[0].newValue).to.equal(undefined);
        });

        it('should get deleted properties', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim1';
            objectWithChangelog.displayName = 'Maxim2';
            objectWithChangelog.displayName = undefined;
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getDeletedProperties().length).to.equal(1);
        });

        it('should get added properties', () => {
            const object = new DataObject('test');
            object.setPosition(new Absolute2DPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.displayName = 'Maxim1';
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getDeletedProperties().length).to.equal(0);
            expect(objectWithChangelog[CHANGELOG_METADATA_KEY].getAddedProperties().length).to.equal(1);
        });

        it('should not break maps', () => {
            @SerializableObject()
            class MyObject {
                @SerializableMapMember(String, String)
                features: Map<string, string>;
            }

            const object = new MyObject();
            object.features = new Map();
            object.features.set('test', '123');
            const objectWithChangelog = createChangeLog(object);
            objectWithChangelog.features.forEach((value, key) => {
            });
        });

        it('should not break dates', () => {
            @SerializableObject()
            class MyObject {
                @SerializableMember()
                date: Date;
            }
            const object = new MyObject();
            object.date = new Date();
            const objectWithChangelog = createChangeLog(object);
            console.log(object)
        });

        it('should detect changes with setters', () => {
            const object = new DataObject('test', 'Maxim');
            object.setPosition(new GeographicalPosition(123, 45));
            const objectWithChangelog = createChangeLog(object);
            (object.position as GeographicalPosition).latitude = 456;
            expect(objectWithChangelog.position[CHANGELOG_METADATA_KEY].getLatestChanges().length).to.equal(1);
            expect(objectWithChangelog.position[CHANGELOG_METADATA_KEY].getLatestChanges()[0].property).to.not.equal("latitude");
            expect(objectWithChangelog.position[CHANGELOG_METADATA_KEY].getLatestChanges()[0].property).to.equal("y");
        });
    });
});
