import { expect } from 'chai';
import 'mocha';
import {
    CallbackSinkNode,
    DataFrame,
    DataObject,
    ModelBuilder,
} from '../../../../src';

describe('node', () => {
    describe('frame filter', () => {
        it('should filter data frames', (done) => {
            ModelBuilder.create()
                .from()
                .filter((frame: DataFrame) => {
                    return frame.source !== undefined;
                })
                .to(
                    new CallbackSinkNode((data: DataFrame) => {
                        expect(data.source).to.not.be.undefined;
                    }),
                )
                .build()
                .then((model) => {
                    Promise.all([
                        model.push(new DataFrame(new DataObject('a'))),
                        model.push(new DataFrame()),
                        model.push(new DataFrame(new DataObject('c'))),
                        model.push(new DataFrame()),
                        model.push(new DataFrame(new DataObject('e'))),
                    ]).then(() => {
                        done();
                    });
                });
        }).timeout(10000);
    });
});
