import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataFrame, Node } from '../../src';
import { NamedNode, CallbackSourceNode, CallbackNode, CallbackSinkNode } from '../../src/nodes';

describe('model', () => {
    describe('builder', () => {

        it('should have an input and output by default', (done) => {
            ModelBuilder.create()
                .build().then(model => {
                    done();
                });
        });

        it('should be able to broadcast to multiple nodes', (done) => {
            ModelBuilder.create()
                .from()
                .via(new NamedNode("1"))
                .via(new NamedNode("2.1"), new NamedNode("2.2"), new NamedNode("2.3"))
                .via(new NamedNode("3"))
                .to()
                .build().then(model => {
                    done();
                });
        });

        it('should reject building when node rejects build', (done) => {
            ModelBuilder.create()
                .from()
                .via(new NamedNode("1"))
                .via(new (class TestNode extends Node<any, any> {
                    constructor() {
                        super();
                        this.once('build', () => new Promise((resolve, reject) => {
                            reject('Test');
                        }));
                    }
                }))
                .via(new NamedNode("3"))
                .to()
                .build().then(model => {
                    done("Model builded succesfully");
                }).catch(ex => {
                    expect(ex).to.equal("Test");
                    done();
                });
        });

        it('should be able to take uids in from, via and to', (done) => {
            ModelBuilder.create()
                .addNode(new NamedNode("1"))
                .addNode(new NamedNode("2"))
                .addNode(new NamedNode("3"))
                .addNode(new NamedNode("4"))
                .from()
                .via("1")
                .via("2", "3")
                .to()
                .from("1")
                .via("4")
                .to()
                .build().then(model => {
                    done();
                }).catch(ex => {
                    done(ex);
                });
        });

    });

    describe('resolve chain', () => {
        it('should only resolve a push after reaching a sink', (done) => {
            const resolved = new Array();
            ModelBuilder.create()
                .from(new CallbackSourceNode(() => {
                    resolved.push(1);
                    return null;
                }))
                .via(new CallbackNode(() => {
                    let counter = 0;
                    for(let i = 0 ; i < 100000 ; i ++) {
                        counter += i;
                    }
                    resolved.push(2);
                },
                () => {
                    resolved.push(2);
                    return null;
                }))
                .to(new CallbackSinkNode(() => {
                    resolved.push(3); 
                }))
                .build().then(model => {
                    Promise.resolve(model.push(new DataFrame())).then(() => {
                        expect(resolved[0]).to.equal(2);
                        expect(resolved[1]).to.equal(3);
                        done();
                    }).catch(ex => {
                        done(ex);
                    });
                });
        });
    });
});