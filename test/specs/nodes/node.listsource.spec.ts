import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, ListSourceNode, Model, ModelBuilder, DataFrame } from '../../../src';
import { PlaceholderNode } from '../../../src/nodes/_internal/PlaceholderNode';

describe('list source', () => {
    describe('layer', () => {
        it('should pop items from the list', (done) => {
            ModelBuilder.create()
                .from(new ListSourceNode([new DataFrame()]))
                .to(
                    new LoggingSinkNode((log) => {
                        done();
                    }),
                )
                .build()
                .then((model) => {
                    Promise.resolve(model.pull());
                });
        });

        it('should add a merge node internally', (done) => {
            ModelBuilder.create()
                .from(new ListSourceNode([new DataFrame()], { uid: '123' }))
                .via(new PlaceholderNode('output'))
                .to(
                    new LoggingSinkNode((log) => {
                        done();
                    }),
                )
                .build()
                .then((model) => {
                    expect(model.findNodeByUID('123').inputData.length).to.equal(1);
                    Promise.resolve(model.pull());
                });
        });
    });
});
