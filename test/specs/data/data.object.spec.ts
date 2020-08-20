import { expect } from 'chai';
import 'mocha';
import { DataObject, RelativeDistancePosition, ModelBuilder, CallbackNode, DataFrame, Absolute2DPosition, AbsolutePosition } from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';
import { DataSerializer } from '../../../src/data/DataSerializer';

describe('data', () => {
    describe('object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DataObject("123");
            dataObject.displayName = "abc";
            dataObject.setPosition(new Absolute2DPosition(2, 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_a"), 1));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_b"), 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_c"), 3));
            const serialized = DataSerializer.serialize(dataObject);
            const deserialized = DataSerializer.deserialize(serialized, DataObject);
            expect(dataObject.uid).to.equal(deserialized.uid);
            expect(dataObject.displayName).to.equal(deserialized.displayName);
            done();
        });

        it('should clone', () => {
            const dataObject = new DataObject("123");
            dataObject.displayName = "abc";
            dataObject.setPosition(new Absolute2DPosition(2, 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_a"), 1));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_b"), 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_c"), 3));
            const clone = dataObject.clone();
            dataObject.displayName = "123";
            dataObject.getPosition().velocity.linear.x = 10;
            expect(clone.displayName).to.equal("abc");
            expect(clone.getPosition()).to.not.be.undefined;
        });

    });

    describe('sensor object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DummySensorObject("123");
            dataObject.displayName = "abc";
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