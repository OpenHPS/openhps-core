import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node } from '../../src';
import { NamedNode, SourceNode, ListSourceNode } from '../../src/nodes';

describe('model', () => {
    describe('builder', () => {

        it('should have an input and output by default', async (done) => {
            const model = await ModelBuilder.create()
                .build();
            done();
        });

        it('should be able to broadcast to multiple nodes', async (done) => {
            const model = await ModelBuilder.create()
                .from()
                .via(new NamedNode("1"))
                .via(new NamedNode("2.1"), new NamedNode("2.2"), new NamedNode("2.3"))
                .via(new NamedNode("3"))
                .to()
                .build();
            done();
        });

    });
});