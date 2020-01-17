import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node, DataObject } from '../../src';
import { DummyDataFrame } from '../mock/data/DummyDataFrame';

describe('data', () => {
    describe('frame', () => {

        it('should be serializable and deserializable', (done) => {
            const dataFrame = new DummyDataFrame();
            dataFrame.addObject(new DataObject("123"));
            dataFrame.setPriority(10);
            const serialzed = dataFrame.serialize();
            const deserialzed = DataFrame.deserialize(serialzed, DummyDataFrame);
            console.log(deserialzed);
            done();
        });

    });
});