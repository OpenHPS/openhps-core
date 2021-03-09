import { expect } from 'chai';
import 'mocha';
import {
    CallbackSinkNode,
    DataFrame,
    DataObject,
    ModelBuilder,
    TimeUnit,
} from '../../../../src';

describe('node', () => {
    describe('frame debounce', () => {
        it('should debounce data frames', (done) => {
            let count = 0;
            ModelBuilder.create()
                .from()
                .debounce(50, TimeUnit.MILLISECOND)
                .to(
                    new CallbackSinkNode((_) => {
                        count++;
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
                        setTimeout(() => {
                            Promise.all([
                                model.push(new DataFrame(new DataObject('a'))),
                                model.push(new DataFrame(new DataObject('b'))),
                                model.push(new DataFrame(new DataObject('c'))),
                                model.push(new DataFrame(new DataObject('d'))),
                                model.push(new DataFrame(new DataObject('e'))),
                            ]).then(() => {
                                expect(count).to.equal(2);
                                model.emit('destroy');
                                done();
                            });
                        }, 100);
                    });
                });
        });
    });
});
