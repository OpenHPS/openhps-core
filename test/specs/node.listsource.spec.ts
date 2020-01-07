import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame } from '../../src';
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

    });
});