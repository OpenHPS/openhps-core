import { expect } from 'chai';
import 'mocha';
import { CallbackSinkNode, DataFrame, DataObject, ModelBuilder } from '../../../../src';

describe('node', () => {
    describe('object filter', () => {
        it('should filter data objects', (done) => {
            ModelBuilder.create()
                .from()
                .filterObjects((object: DataObject) => {
                    return object.uid.startsWith('a');
                })
                .to(
                    new CallbackSinkNode((data: DataFrame) => {
                        if (data.source !== undefined) expect(data.source.uid.startsWith('a'));
                    }),
                )
                .build()
                .then((model) => {
                    Promise.all([
                        model.push(new DataFrame(new DataObject('ab'))),
                        model.push(new DataFrame(new DataObject('c'))),
                        model.push(new DataFrame(new DataObject('ae'))),
                    ]).then(() => {
                        done();
                    });
                });
        }).timeout(10000);
    });
});
