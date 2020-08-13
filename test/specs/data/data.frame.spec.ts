import { expect } from 'chai';
import 'mocha';
import { DataObject, IMUDataFrame } from '../../../src';
import { DummyDataFrame } from '../../mock/data/DummyDataFrame';
import { DummyDataObject } from '../../mock/data/object/DummyDataObject';
import { DataSerializer } from '../../../src/data/DataSerializer';

describe('data', () => {
    describe('frame', () => {

        it('should be serializable and deserializable', (done) => {
            const dataFrame = new DummyDataFrame();
            dataFrame.addObject(new DataObject("123"));
            dataFrame.addObject(new DummyDataObject());
            const serialized = DataSerializer.serialize(dataFrame);
            const deserialized = DataSerializer.deserialize(serialized, DummyDataFrame);
            expect(deserialized.getObjects().length).to.equal(dataFrame.getObjects().length);
            expect(deserialized.getObjects()[0]).to.be.instanceOf(DataObject);
            expect(deserialized.getObjects()[1]).to.be.instanceOf(DummyDataObject);
            done();
        });

        it('should get specific object types', () => {
            const dataFrame = new DummyDataFrame();
            dataFrame.addObject(new DataObject("123"));
            dataFrame.addObject(new DummyDataObject());
            expect(dataFrame.getObjects(DummyDataObject).length).to.equal(1);
        });

    });

    describe('motion data frame', () => {

        it('should be serializable and deserializable', (done) => {
            const dataFrame = new IMUDataFrame();
            const serialized = DataSerializer.serialize(dataFrame);
            const deserialized = DataSerializer.deserialize(serialized, IMUDataFrame);
            done();
        });

   });

});