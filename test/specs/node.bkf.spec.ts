import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, BKFProcessingNode, DataObject } from '../../src';
import { LoggingSinkNode } from '../../src/nodes/sink';
import { DummySensorDataFrame } from '../mock/data/DummySensorDataFrame';

describe('node', () => {
    describe('basic kalman filter', () => {

        it('should filter values in a data frame', (done) => {
            new ModelBuilder()
                .from()
                .via(new BKFProcessingNode())
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
