import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataFrame, BalanceNode, LoggingSinkNode } from '../../../../src';
import { TimeConsumingNode } from '../../../mock/nodes/TimeConsumingNode';

describe('node', () => {
    describe('balance', () => {
        it('should take 30ms to execute with one time consuming layer', (done) => {
            ModelBuilder.create()
                .from()
                .via(new BalanceNode())
                .via(new TimeConsumingNode())
                .to(new LoggingSinkNode())
                .build()
                .then((model) => {
                    // Push three frames and wait for them to finish
                    const start = new Date().getTime();
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]).then((_) => {
                        const end = new Date().getTime();
                        const diff = end - start;
                        expect(diff).to.be.lessThan(50);
                        done();
                    });
                });
        });

        it('should take 10ms to execute with 3 time consuming layers', (done) => {
            ModelBuilder.create()
                .from()
                .via(new BalanceNode())
                .via(new TimeConsumingNode(), new TimeConsumingNode(), new TimeConsumingNode())
                .to(new LoggingSinkNode())
                .build()
                .then((model) => {
                    // Push three frames and wait for them to finish
                    const start = new Date().getTime();
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]).then((_) => {
                        const end = new Date().getTime();
                        const diff = end - start;
                        expect(diff).to.be.lessThan(20);
                        done();
                    });
                });
        });

        it('should take 20ms to execute with 2 time consuming layers', (done) => {
            ModelBuilder.create()
                .from()
                .via(new BalanceNode())
                .via(new TimeConsumingNode(), new TimeConsumingNode())
                .to(new LoggingSinkNode())
                .build()
                .then((model) => {
                    // Push three frames and wait for them to finish
                    const start = new Date().getTime();
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]).then((_) => {
                        const end = new Date().getTime();
                        const diff = end - start;
                        expect(diff).to.be.lessThan(30);
                        done();
                    });
                });
        });
    });
});
