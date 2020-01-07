import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame } from '../../src';
import { TimeConsumingNode } from '../mock/nodes/TimeConsumingNode';
import { BalanceNode } from '../../src/nodes/shapes/BalanceNode';
import { LoggingSinkNode } from '../../src/nodes/sink';

describe('node', () => {
    describe('balance', () => {

        it('should take 30ms to execute with one time consuming layer', (done) => {
            const model = new ModelBuilder()
                .to(new BalanceNode())
                .to(new TimeConsumingNode())
                .to(new LoggingSinkNode())
                .build();
            
            // Push three frames and wait for them to finish
            Promise.all([
                model.push(new DataFrame()),
                model.push(new DataFrame()),
                model.push(new DataFrame()),
            ]).then(_ => {
                done();
            });
        }).timeout(40);

        it('should take 10ms to execute with 3 time consuming layers', (done) => {
            const model = new ModelBuilder()
            .to(new BalanceNode())
            .to(new TimeConsumingNode(), new TimeConsumingNode(), new TimeConsumingNode())
            .to(new LoggingSinkNode())
            .build();
            // Push three frames and wait for them to finish
            Promise.all([
                model.push(new DataFrame()),
                model.push(new DataFrame()),
                model.push(new DataFrame())
            ]).then(_ => {
                done();
            });
        }).timeout(20);

        it('should take 20ms to execute with 2 time consuming layers', (done) => {
            const model = new ModelBuilder()
            .to(new BalanceNode())
            .to(new TimeConsumingNode(), new TimeConsumingNode())
            .to(new LoggingSinkNode())
            .build();
            // Push three frames and wait for them to finish
            Promise.all([
                model.push(new DataFrame()),
                model.push(new DataFrame()),
                model.push(new DataFrame())
            ]).then(_ => {
                done();
            });
        }).timeout(30);


    });
});