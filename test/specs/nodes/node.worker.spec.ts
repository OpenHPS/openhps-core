import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, WorkerProcessingNode, WorkerNode, CallbackSinkNode } from '../../../src';
import * as path from 'path';

describe('node', () => {
    describe('worker js', () => {
        
        it('should process data as a normal node', (done) => {
            new ModelBuilder()
                .from()
                .via(new WorkerProcessingNode('../../../test/mock/nodes/WorkerTask.js'))
                .to()
                .build().then(model => {
                    // Push three frames and wait for them to finish
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame())
                    ]).then(_ => {
                        Promise.resolve(model.emit('destroy'));
                        done();
                    });
                });
        }).timeout(3000);

    });
    describe('worker ts', () => {
        
        it('should process data as a normal node', (done) => {
            new ModelBuilder()
                .from()
                .via(new WorkerProcessingNode('../../../test/mock/nodes/WorkerTask.ts'))
                .to()
                .build().then(model => {
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame())
                    ]).then(_ => {
                        Promise.resolve(model.emit('destroy'));
                        done();
                    });
                });
        }).timeout(3000);

    });

    describe('worker node', () => {
        it('should take 30ms with 1 worker', (done) => {
            new ModelBuilder()
                .from()
                .via(new WorkerNode((builder) => {
                    const { TimeConsumingNode } = require(path.join(__dirname, '../../mock/nodes/TimeConsumingNode'));
                    builder.via(new TimeConsumingNode());
                }, {
                    directory: __dirname,
                    poolSize: 1
                }))
                .to(new CallbackSinkNode((data: DataFrame) => {
                    expect(data.getObjects()[0].uid).to.equal("time object");
                }))
                .build().then(model => {
                    // Push three frames and wait for them to finish
                    const start = new Date().getTime();
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]).then(_ => {
                        const end = new Date().getTime();
                        const diff = end - start;
                        expect(diff).to.be.lessThan(55);
                        model.emit('destroy');
                        done();
                    });
                });
        }).timeout(30000);

        it('should take 20ms with 2 workers', (done) => {
            new ModelBuilder()
                .from()
                .via(new WorkerNode((builder) => {
                    const { TimeConsumingNode } = require(path.join(__dirname, '../../mock/nodes/TimeConsumingNode'));
                    builder.via(new TimeConsumingNode());
                }, {
                    directory: __dirname,
                    poolSize: 2
                }))
                .to(new CallbackSinkNode((data: DataFrame) => {
                    expect(data.getObjects()[0].uid).to.equal("time object");
                }))
                .build().then(model => {
                    // Push three frames and wait for them to finish
                    const start = new Date().getTime();
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]).then(_ => {
                        const end = new Date().getTime();
                        const diff = end - start;
                        expect(diff).to.be.lessThan(40);
                        model.emit('destroy');
                        done();
                    });
                });
        }).timeout(30000);

        it('should take 10ms with 3 workers', (done) => {
            new ModelBuilder()
                .from()
                .via(new WorkerNode((builder) => {
                    const { TimeConsumingNode } = require(path.join(__dirname, '../../mock/nodes/TimeConsumingNode'));
                    builder.via(new TimeConsumingNode());
                }, {
                    directory: __dirname,
                    poolSize: 3
                }))
                .to(new CallbackSinkNode((data: DataFrame) => {
                    expect(data.getObjects()[0].uid).to.equal("time object");
                }))
                .build().then(model => {
                    // Push three frames and wait for them to finish
                    const start = new Date().getTime();
                    Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]).then(_ => {
                        const end = new Date().getTime();
                        const diff = end - start;
                        expect(diff).to.be.lessThan(30);
                        model.emit('destroy');
                        done();
                    });
                });
        }).timeout(30000);
    });
});