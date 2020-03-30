import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, NamedNode } from '../../../src';
import { LoggingSinkNode } from '../../../src/nodes/sink/LoggingSinkNode';
import { ListSourceNode } from '../../../src/nodes/source/ListSourceNode';

describe('list source', () => {
    describe('layer', () => {

        it('should pop items from the list', (done) => {
            ModelBuilder.create()
                .from(new ListSourceNode([new DataFrame()]))
                .to(new LoggingSinkNode((log) => {
                    done();
                }))
                .build().then(model => {
                    Promise.resolve(model.pull());
                });
        });

        
        it('should add a merge node internally', (done) => {
            ModelBuilder.create()
                .from(new ListSourceNode([new DataFrame()]))
                .via(new NamedNode("output"))
                .to(new LoggingSinkNode((log) => {
                    done();
                }))
                .build().then(model => {
                    Promise.resolve(model.pull());
                });
        });

    });
});