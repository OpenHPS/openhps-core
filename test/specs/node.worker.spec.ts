import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, WorkerProcessingNode, WorkerNode, CallbackSinkNode } from '../../src';
import * as path from 'path';

describe('node', () => {
    describe('worker js', () => {
        
        it('should process data as a normal node', (done) => {
            const model = new ModelBuilder()
                .to(new WorkerProcessingNode('../../../test/mock/nodes/WorkerTask.js'))
                .build();

            model.on('ready', () => {
                // Push three frames and wait for them to finish
                Promise.all([
                    model.push(new DataFrame()),
                    model.push(new DataFrame()),
                    model.push(new DataFrame())
                ]).then(_ => {
                    Promise.resolve(model.trigger('destroy'));
                    done();
                });
            });
        }).timeout(3000);

    });
    describe('worker ts', () => {
        
        it('should process data as a normal node', (done) => {
            const model = new ModelBuilder()
                .to(new WorkerProcessingNode('../../../test/mock/nodes/WorkerTask.ts'))
                .build();

            model.on('ready', () => {
                // Push three frames and wait for them to finish
                Promise.all([
                    model.push(new DataFrame()),
                    model.push(new DataFrame()),
                    model.push(new DataFrame())
                ]).then(_ => {
                    Promise.resolve(model.trigger('destroy'));
                    done();
                });
            });
        }).timeout(3000);

    });

    describe('worker node', () => {
        it('should process data as a normal node', (done) => {
            const model = new ModelBuilder()
                .to(new WorkerNode((builder) => {
                    const { TimeConsumingNode } = require(path.join(__dirname, '../mock/nodes/TimeConsumingNode'));
                    builder.to(new TimeConsumingNode());
                }, __dirname))
                .to(new CallbackSinkNode((data: DataFrame) => {
                    //expect(data.getObjects()[0].uid).to.equal("time object");
                }))
                .build();

            model.on('ready', () => {
                // Push three frames and wait for them to finish
                Promise.all([
                    model.push(new DataFrame()),
                    model.push(new DataFrame()),
                    model.push(new DataFrame())
                ]).then(_ => {
                    Promise.resolve(model.trigger('destroy'));
                    done();
                });
            });
        }).timeout(30000);
    });
});