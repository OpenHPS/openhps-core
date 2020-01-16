import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, WorkerProcessingNode } from '../../src';

describe('node', () => {
    describe('worker', () => {
        
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
});