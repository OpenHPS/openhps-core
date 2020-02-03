import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node, DataObject } from '../../src';
import { DummyDataFrame } from '../mock/data/DummyDataFrame';
import { DummyDataObject } from '../mock/data/object/DummyDataObject';

describe('data', () => {
    describe('frame', () => {

        it('should be serializable and deserializable', (done) => {
            const dataFrame = new DummyDataFrame();
            dataFrame.addObject(new DataObject("123"));
            dataFrame.addObject(new DummyDataObject());
            const serialized = dataFrame.serialize();
            const deserialized = DataFrame.deserialize(serialized, DummyDataFrame);
            done();
        });

    });
});