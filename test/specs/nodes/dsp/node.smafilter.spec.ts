import { expect } from 'chai';
import 'mocha';
import {
    DataFrame,
    Model,
    ModelBuilder,
    DataObject,
    ListSourceNode,
    SMAFilterNode,
    LoggingSinkNode,
} from '../../../../src';
import { DummyDataFilterObject } from '../../../mock/data/object/DummyDataFilterObject';

describe('SMAFilterNode', () => {
    it('should filter values in a data frame', (done) => {
        let model: Model<any, any>;
        let count = 0;
        ModelBuilder.create()
            .from(
                new ListSourceNode([
                    new DataFrame(new DummyDataFilterObject('abc', 1)),
                    new DataFrame(new DummyDataFilterObject('abc', 2)),
                    new DataFrame(new DummyDataFilterObject('abc', 10)),
                    new DataFrame(new DummyDataFilterObject('abc', 12)),
                    new DataFrame(new DummyDataFilterObject('abc', 11)),
                ]),
            )
            .via(
                new SMAFilterNode(
                    (object: DummyDataFilterObject) => {
                        return [{
                            key: 'reading',
                            value: object.reading
                        }];
                    },
                    (key: string, value: number, object: DummyDataFilterObject) => {
                        object[key] = value;
                    },
                    {
                        objectFilter: (object: DataObject) => object instanceof DummyDataFilterObject,
                        taps: 4,
                    },
                ),
            )
            .to(
                new LoggingSinkNode<DataFrame>((frame: DataFrame) => {
                    if ((frame.source as DummyDataFilterObject).reading >= 11) {
                        done(new Error(`SMA did not work!`));
                    }
                    if (count < 4) {
                        Promise.resolve(model.pull());
                        count++;
                    } else {
                        done();
                    }
                }),
            )
            .build()
            .then((m: Model) => {
                model = m;
                Promise.resolve(model.pull());
            });
    });
});
