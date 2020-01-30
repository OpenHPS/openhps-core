import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, Node } from '../../src';
import { NamedNode, SourceNode, ListSourceNode } from '../../src/nodes';

describe('model', () => {
    describe('builder', () => {

        it('should have an input and output by default', (done) => {
            const model = new ModelBuilder()
                .build();
            done();
        });

        it('should be able to broadcast to multiple nodes', (done) => {
            const model = new ModelBuilder()
                .to(new NamedNode("1"))
                .to(new NamedNode("2.1"), new NamedNode("2.2"), new NamedNode("2.3"))
                .to(new NamedNode("3"))
                .build();
            done();
        });

    });
});