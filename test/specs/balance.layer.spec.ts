import { expect } from 'chai';
import 'mocha';
import { Model, BalanceLayerContainer, DataFrame, LoggerOutputLayer } from '../../src';
import { TimeConsumingLayer } from '../mock/layer/TimeConsumingLayer';

describe('balance', () => {
    describe('layer', () => {

        it('should take long to execute with one time consuming layer', (done) => {
            const model = new Model()
                .withLayer(new BalanceLayerContainer()
                    .withLayer(new TimeConsumingLayer()))
                .withLayer(new LoggerOutputLayer());
            // Push three frames and wait for them to finish
            model.push(new DataFrame()).then(_ => {
                return model.push(new DataFrame());
            }).then(_ => {
                return model.push(new DataFrame());
            }).then(_ => {
                done();
            });
        }).timeout(3050);

        it('should be faster to execute with multiple time consuming layers', (done) => {
            const model = new Model()
                .withLayer(new BalanceLayerContainer()
                    .withLayer(new TimeConsumingLayer())
                    .withLayer(new TimeConsumingLayer())
                    .withLayer(new TimeConsumingLayer()))
                .withLayer(new LoggerOutputLayer());
            // Push three frames and wait for them to finish
            Promise.all([
                model.push(new DataFrame()),
                model.push(new DataFrame()),
                model.push(new DataFrame())
            ]).then(_ => {
                done();
            });
        }).timeout(1050);

    });
});