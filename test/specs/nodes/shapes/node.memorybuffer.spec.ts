import { expect } from 'chai';
import 'mocha';
import { CallbackSinkNode, DataFrame, DataObject, ModelBuilder } from '../../../../src';

describe('node', () => {
    describe('frame memory buffer', () => {
        it('should buffer pushed frames', (done) => {
            let ready = false;
            ModelBuilder.create()
                .from()
                .buffer()
                .to(
                    new CallbackSinkNode((data: DataFrame) => {
                        if (!ready) {
                            done(`Not buffered!`);
                        } else {
                            done();
                        }
                    }),
                )
                .build()
                .then((model) => {
                    Promise.all([
                        model.push(new DataFrame(new DataObject('a'))),
                        model.push(new DataFrame(new DataObject('b'))),
                        model.push(new DataFrame(new DataObject('c'))),
                        model.push(new DataFrame(new DataObject('d'))),
                        model.push(new DataFrame(new DataObject('e'))),
                    ]).then(() => {
                        ready = true;
                        Promise.resolve(model.pull());
                    });
                });
        }).timeout(10000);
    });
});
