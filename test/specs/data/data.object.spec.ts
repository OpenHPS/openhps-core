import { expect } from 'chai';
import 'mocha';
import {
    DataSerializer,
    DataObject,
    RelativeDistancePosition,
    ModelBuilder,
    CallbackNode,
    DataFrame,
    Absolute2DPosition,
    AbsolutePosition,
    CallbackSinkNode,
    LinearVelocity,
    Model,
} from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';

describe('data', () => {
    describe('object', () => {
        it('should have a uuidv4 uid', (done) => {
            const obj = new DataObject();
            expect(obj.uid).to.include("-");
            done();
        });

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DataObject('123');
            dataObject.displayName = 'abc';
            dataObject.setPosition(new Absolute2DPosition(2, 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject('ref_a'), 1));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject('ref_b'), 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject('ref_c'), 3));
            const serialized = DataSerializer.serialize(dataObject);
            const deserialized = DataSerializer.deserialize(serialized, DataObject);
            expect(dataObject.uid).to.equal(deserialized.uid);
            expect(dataObject.displayName).to.equal(deserialized.displayName);
            done();
        });

        it('should clone', () => {
            const dataObject = new DataObject('123');
            dataObject.displayName = 'abc';
            dataObject.setPosition(new Absolute2DPosition(2, 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject('ref_a'), 1));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject('ref_b'), 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject('ref_c'), 3));
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
                });
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
