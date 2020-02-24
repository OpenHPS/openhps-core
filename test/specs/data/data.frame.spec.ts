import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node, DataObject } from '../../../src';
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

    });
});