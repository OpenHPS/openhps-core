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
} from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';

describe('DataObject', () => {
    it('should have a uuidv4 uid', (done) => {
        const obj = new DataObject();
        expect(obj.uid).to.include("-");
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
        serialized.relativePositions = serialized.relativePositions.map(r => {
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

    it('should support listeners', (done) => {
        const dataObject = new DataObject('123');
        ModelBuilder.create()
            .from()
            .via(new CallbackNode(frame => {
                frame.source.displayName = "maxim";
            }))
            .to(new CallbackSinkNode())
            .build().then((model: Model) => {
                model.findDataService(DataObject).on('insert', (uid, obj) => {
                    expect(obj.displayName).to.eq("maxim");
                    done();
                });
                model.push(new DataFrame(dataObject));
            }).catch(done);
    });

    describe('binding', () => {
        it('should support saving', (done) => {
            ModelBuilder.create()
                .from()
                .to()
                .build().then((model: Model) => {
                    const object = new DataObject("mvdewync", "Maxim");
                    object.bind(model.findDataService(object)).save().then(() => {
                        done();
                    }).catch(done);
                });
        }); 

        it('should support saving with changes', (done) => {
            ModelBuilder.create()
                .from()
                .to()
                .build().then((model: Model) => {
                    const object = new DataObject("mvdewync", "Maxim");
                    const binding = object.bind(model.findDataService(object));
                    object.uid += "1";
                    binding.on('update', (newObj, oldObj) => {
                    });
                    binding.save().then(() => {
                        done();
                    }).catch(done);
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
        const object = new DataObject("test");
    });

});