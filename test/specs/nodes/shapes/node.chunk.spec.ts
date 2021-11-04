import { expect } from 'chai';
import 'mocha';
import { CallbackSinkNode, DataFrame, DataObject, ModelBuilder } from '../../../../src';

describe('node', () => {
    describe('frame chunk', () => {
        it('should chunk data frames in frames of 3', (done) => {
            ModelBuilder.create()
                .from()
                .chunk(3)
                .to(
                    new CallbackSinkNode((data: DataFrame[]) => {
                        expect(data.length).to.equal(3);
                        done();
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
                    ]);
                });
        });

        it('should chunk data frames in frames of 3 unless a timeout happens', (done) => {
            let itt = 0;
            let model;
            ModelBuilder.create()
                .from()
                .chunk(3, 1)
                .to(
                    new CallbackSinkNode((data: DataFrame[]) => {
                        switch (itt) {
                            case 0:
                                expect(data.length).to.equal(3);
                                break;
                            case 1:
                                expect(data.length).to.equal(2);
                                model.emit('destroy');
                                done();
                                break;
                        }
                        itt++;
                    }),
                )
                .build()
                .then((m) => {
                    model = m;
                    Promise.all([
                        model.push(new DataFrame(new DataObject('a'))),
                        model.push(new DataFrame(new DataObject('b'))),
                        model.push(new DataFrame(new DataObject('c'))),
                        model.push(new DataFrame(new DataObject('d'))),
                        model.push(new DataFrame(new DataObject('e'))),
                    ]);
                });
        });
    });
});
