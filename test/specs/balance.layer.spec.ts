import { expect } from 'chai';
import 'mocha';
import { Model, DataFrame } from '../../src';
import { BalanceLayerContainer, LoggerOutputLayer, OutputLayer } from '../../src/layer';
import { TimeConsumingLayer } from '../mock/layer/TimeConsumingLayer';
import { ModelBuilder } from '../../src/Model';

describe('balance', () => {
    describe('layer', () => {

        it('should take 30ms to execute with one time consuming layer', (done) => {
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
        }).timeout(40);

        it('should take 10ms to execute with 3 time consuming layers', (done) => {
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
        }).timeout(20);

        it('should take 20ms to execute with 2 time consuming layers', (done) => {
            const model = new ModelBuilder()
                .withLayer(new BalanceLayerContainer()
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
        }).timeout(30);


    });
});