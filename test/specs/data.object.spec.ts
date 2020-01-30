import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node, DataObject, SensorObject } from '../../src';
import { DummyDataFrame } from '../mock/data/DummyDataFrame';
import { DummyDataObject } from '../mock/data/object/DummyDataObject';
import { DummySensorObject } from '../mock/data/object/DummySensorObject';

describe('data', () => {
    describe('object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DataObject("123");
            dataObject.displayName = "abc";
            dataObject.setNodeData('x', { test: [1, 2, 3] });
            const serialized = dataObject.serialize();
            const deserialized = DataObject.deserialize(serialized, DataObject);
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
            dataObject.horizontalFOV = [1, 1, 1];
            const serialized = dataObject.serialize();
            const deserialized = DataObject.deserialize(serialized, DummySensorObject);
            expect(dataObject.uid).to.equal(deserialized.uid);
            expect(dataObject.displayName).to.equal(deserialized.displayName);
            expect(dataObject.horizontalFOV[0]).to.equal(1);
            done();
        });

    });
});