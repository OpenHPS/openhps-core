import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node, DataObject } from '../../src';
import { DummyDataFrame } from '../mock/data/DummyDataFrame';
import { DummyDataObject } from '../mock/data/object/DummyDataObject';

describe('data', () => {
    describe('object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DataObject("123");
            dataObject.displayName = "abc";
            const serialized = dataObject.serialize();
            const deserialized = DataObject.deserialize(serialized, DataObject);
            expect(dataObject.uid).to.equal(deserialized.uid);
            expect(dataObject.displayName).to.equal(deserialized.displayName);
            done();
        });

    });
});