import { expect } from 'chai';
import 'mocha';
import { DataObject, RelativeDistanceLocation } from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';
import { DataSerializer } from '../../../src/data/DataSerializer';

describe('data', () => {
    describe('object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DataObject("123");
            dataObject.displayName = "abc";
            dataObject.setNodeData('x', { test: [1, 2, 3] });
            dataObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("ref_a"), 1));
            dataObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("ref_b"), 2));
            dataObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("ref_c"), 3));
            const serialized = DataSerializer.serialize(dataObject);
            const deserialized = DataSerializer.deserialize(serialized, DataObject);
            expect(dataObject.uid).to.equal(deserialized.uid);
            expect(dataObject.displayName).to.equal(deserialized.displayName);
            done();
        });

    });

    describe('sensor object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DummySensorObject("123");
            dataObject.displayName = "abc";
            dataObject.setNodeData('x', { test: [1, 2, 3] });
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