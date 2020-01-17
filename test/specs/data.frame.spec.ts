import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node, DataObject } from '../../src';

describe('data', () => {
    describe('frame', () => {

        it('should be serializable and deserializable', (done) => {
            const dataFrame = new DataFrame();
            dataFrame.addObject(new DataObject("123"));
            dataFrame.setPriority(10);
            const serialzed = dataFrame.serialize();
            const deserialzed = DataFrame.deserialize(serialzed, DataFrame);
            done();
        });

    });
});