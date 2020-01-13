import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, NamedNode } from '../../src';
import { LoggingSinkNode } from '../../src/nodes/sink/LoggingSinkNode';
import { ListSourceNode } from '../../src/nodes/source/ListSourceNode';

describe('list source', () => {
    describe('layer', () => {

        it('should pop items from the list', (done) => {
            const list = new Array<DataFrame>();

            const model = new ModelBuilder()
                .to(new ListSourceNode(list))
                .to(new LoggingSinkNode())
                .build();
                
            done();
        });

        
        it('should add a merge node internally', (done) => {
            const model = new ModelBuilder()
                .to(new ListSourceNode([]))
                .to(new NamedNode("output"))
                .build();
            console.log(model.serialize());
            done();
        });

    });
});