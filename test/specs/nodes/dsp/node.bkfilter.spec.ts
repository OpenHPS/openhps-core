import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, Model, ModelBuilder, DataFrame, DataObject, ListSourceNode, BKFilterNode } from '../../../../src';
import { DummyDataFilterObject } from '../../../mock/data/object/DummyDataFilterObject';

describe('node', () => {
    describe('basic kalman filter', () => {

        it('should filter values in a data frame', (done) => {
            let model: Model<any, any>;
            let count: number = 0;
            ModelBuilder.create()
                .from(new ListSourceNode([
                    new DataFrame(new DummyDataFilterObject("abc", 1)),
                    new DataFrame(new DummyDataFilterObject("abc", 2)),
                    new DataFrame(new DummyDataFilterObject("abc", 10)),
                    new DataFrame(new DummyDataFilterObject("abc", 12)),
                    new DataFrame(new DummyDataFilterObject("abc", 11))
                ]))
                .via(new BKFilterNode(
                    (object: DummyDataFilterObject) => {
                        return 'reading';
                    },{
                        R: 1,
                        A: 1,
                        B: 1,
                        C: 1,
                        Q: 1,
                        objectFilter: (object: DataObject) => object instanceof DummyDataFilterObject,
                    }))
                .to(new LoggingSinkNode<DataFrame>((frame: DataFrame) => {
                    if ((frame.source as DummyDataFilterObject).reading >= 11) {
                        done(new Error(`BKF did not work!`));
                    }
                    if (count < 4) {
                        Promise.resolve(model.pull());
                        count++;
                    } else {
                        done();
                    }
                }))
                .build().then((m: Model) => {
                    model = m;
                    Promise.resolve(model.pull());
                });
        });

    });
});
