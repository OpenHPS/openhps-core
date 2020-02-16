import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, NamedNode } from '../../src';
import { LoggingSinkNode } from '../../src/nodes/sink/LoggingSinkNode';
import { ListSourceNode } from '../../src/nodes/source/ListSourceNode';

describe('list source', () => {
    describe('layer', () => {

        it('should pop items from the list', async (done) => {
            const model = await ModelBuilder.create()
                .from(new ListSourceNode([new DataFrame()]))
                .to(new LoggingSinkNode((log) => {
                    done();
                }))
                .build();
            Promise.resolve(model.pull());
        });

        
        it('should add a merge node internally', async (done) => {
            const model = await ModelBuilder.create()
                .from(new ListSourceNode([new DataFrame()]))
                .via(new NamedNode("output"))
                .to(new LoggingSinkNode((log) => {
                    done();
                }))
                .build();
            Promise.resolve(model.pull());
        });

    });
});