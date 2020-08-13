import { expect } from 'chai';
import 'mocha';
import { DataFrame, DataSerializer, Model, ModelBuilder, CallbackSinkNode, DataObject, ListSourceNode, SMAFilterNode, LoggingSinkNode, HPFilterNode, LPFilterNode } from '../../../../src';
import { DummyDataFilterObject } from '../../../mock/data/object/DummyDataFilterObject';

describe('node', () => {
    describe('low-pass filter', () => {
      
        // TODO: test is not valid
        it('should filter values in a data frame', (done) => {
            let model: Model<any, any>;
            let count: number = 0;
            ModelBuilder.create()
                .from(new ListSourceNode([
                    new DataFrame(new DummyDataFilterObject("abc", 0)),
                    new DataFrame(new DummyDataFilterObject("abc", 1)),
                    new DataFrame(new DummyDataFilterObject("abc", 0)),
                    new DataFrame(new DummyDataFilterObject("abc", 1)),
                    new DataFrame(new DummyDataFilterObject("abc", 0)),
                ]))
                .via(new LPFilterNode(
                    (object: DummyDataFilterObject) => {
                        return 'reading';
                    },{
                        cutOff: 0.5,
                        sampleRate: 1,
                        objectFilter: (object: DataObject) => object instanceof DummyDataFilterObject,
                    }))
                .to(new LoggingSinkNode<DataFrame>((frame: DataFrame) => {
                    if ((frame.source as DummyDataFilterObject).reading >= 11) {
                        done(new Error(`LPF did not work!`));
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