import { expect } from 'chai';
import 'mocha';
import { Model, BalanceLayerContainer, DataFrame, LoggerOutputLayer, OutputLayer } from '../../src';
import { TimeConsumingLayer } from '../mock/layer/TimeConsumingLayer';
import { ModelBuilder } from '../../src/Model';

describe('balance', () => {
    describe('layer', () => {

        it('should take long to execute with one time consuming layer', (done) => {
            const model = new ModelBuilder()
                .withLayer(new BalanceLayerContainer()
                    .withLayer(new TimeConsumingLayer()))
                .withLayer(new OutputLayer())
                .build();
            // Push three frames and wait for them to finish
            Promise.all([
                model.push(new DataFrame()),
                model.push(new DataFrame()),
                model.push(new DataFrame())
            ]).then(_ => {
                done();
            });
        }).timeout(350);

        it('should be faster to execute with multiple time consuming layers', (done) => {
            const model = new ModelBuilder()
                .withLayer(new BalanceLayerContainer()
                    .withLayer(new TimeConsumingLayer())
                    .withLayer(new TimeConsumingLayer())
                    .withLayer(new TimeConsumingLayer()))
                .withLayer(new OutputLayer())
                .build();
            // Push three frames and wait for them to finish
            Promise.all([
                model.push(new DataFrame()),
                model.push(new DataFrame()),
                model.push(new DataFrame())
            ]).then(_ => {
                done();
            });
        }).timeout(150);

    });
});