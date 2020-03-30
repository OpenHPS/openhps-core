import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, Model, ModelBuilder, DataFrame, BKFilterNode, DataObject } from '../../../src';
import { DummySensorDataFrame } from '../../mock/data/DummySensorDataFrame';

describe('node', () => {
    describe('basic kalman filter', () => {

        it('should filter values in a data frame', (done) => {
            ModelBuilder.create()
                .from()
                .via(new BKFilterNode({
                    R: 1,
                    A: 1,
                    B: 1,
                    C: 1,
                    Q: 1
                }))
                .to(new LoggingSinkNode<DummySensorDataFrame>((frame) => {
                    if (frame.reading > 10) {
                        done();
                    }
                }))
                .build().then(model => {
                    const source = new DataObject("abc");
                    Promise.all([
                        model.push(new DummySensorDataFrame(source, 1)),
                        model.push(new DummySensorDataFrame(source, 2)),
                        model.push(new DummySensorDataFrame(source, 10)),
                        model.push(new DummySensorDataFrame(source, 12)),
                    ]).then(_ => {
                        
                    });
                });
        });

    });
});
