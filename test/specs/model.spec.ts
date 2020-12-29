import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    Node,
    GraphBuilder,
    EdgeBuilder,
    NamedNode,
    CallbackSourceNode,
    CallbackNode,
    CallbackSinkNode,
    ProcessingNode,
    Model,
} from '../../src';

describe('model', () => {
    describe('builder', () => {
        it('should have an input and output by default', (done) => {
            ModelBuilder.create()
                .build()
                .then((model) => {
                    done();
                });
        });

        it('should be able to push chunks of frames', (done) => {
            ModelBuilder.create()
                .build()
                .then((model) => {
                    return model.push([new DataFrame(), new DataFrame()]);
                })
                .then(() => {
                    done();
                });
        });

        it('should be able to broadcast to multiple nodes', (done) => {
            ModelBuilder.create()
                .from()
                .via(new NamedNode('1'))
                .via(new NamedNode('2.1'), new NamedNode('2.2'), new NamedNode('2.3'))
                .via(new NamedNode('3'))
                .to()
                .build()
                .then((model) => {
                    done();
                });
        });

        it('should reject building when node rejects build', (done) => {
            ModelBuilder.create()
                .from()
                .via(new NamedNode('1'))
                .via(
                    new (class TestNode extends Node<any, any> {
                        constructor() {
                            super();
                            this.once(
                                'build',
                                () =>
                                    new Promise((resolve, reject) => {
                                        reject('Test');
                                    }),
                            );
                        }
                    })(),
                )
                .via(new NamedNode('3'))
                .to()
                .build()
                .then((model) => {
                    done('Model builded succesfully');
                })
                .catch((ex) => {
                    expect(ex).to.equal('Test');
                    done();
                });
        });

        it('should be able to take names in from, via and to', (done) => {
            ModelBuilder.create()
                .addNode(new NamedNode('1'))
                .addNode(new NamedNode('2'))
                .addNode(new NamedNode('3'))
                .addNode(new NamedNode('4'))
                .from()
                .via('1')
                .via('2', '3')
                .to()
                .from('1')
                .via('4')
                .to()
                .build()
                .then((model) => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should be able to take names from other shapes', (done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .addNode(new NamedNode('1'))
                    .addNode(new NamedNode('2'))
                    .addNode(new NamedNode('3'))
                    .addNode(new NamedNode('4'))
                )
                .from()
                .via('1')
                .via('2', '3')
                .to()
                .from('1')
                .via('4')
                .to()
                .build()
                .then((model) => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should be able to take names in other shapes', (done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .addNode(new NamedNode('1'))
                    .addNode(new NamedNode('2'))
                    .addNode(new NamedNode('3'))
                    .addNode(new NamedNode('4'))
                )
                .addShape(GraphBuilder.create()
                    .from()
                    .via('1')
                    .via('2', '3')
                    .to())
                .addShape(GraphBuilder.create()
                    .from('1')
                    .via('4')
                    .to())
                .build()
                .then((model) => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should be able to use string shapes as placeholder without being defined', (done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .from()
                    .via('1')
                    .via('2', '3')
                    .to())
                .addShape(GraphBuilder.create()
                    .from('1')
                    .via('4')
                    .to())
                .build()
                .then((model) => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should be able to take graph shapes', (done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create().from().via(new NamedNode('1'), new NamedNode('2')).to())
                .build()
                .then((model) => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });
    });

    describe('graph builder', () => {
        it('should support adding nodes and edges manually', (done) => {
            const node1 = new NamedNode('1');
            const node2 = new NamedNode('2');
            GraphBuilder.create()
                .addNode(node1)
                .addNode(node2)
                .addEdge(EdgeBuilder.create().from(node1).to(node2).build())
                .build()
                .then((graph) => {
                    done();
                });
        });
    });

    describe('pushing', () => {
        it('should store the source in the options', (done) => {
            ModelBuilder.create()
                .from(new CallbackSourceNode(() => {
                    return new DataFrame();
                }, {
                    uid: "n_s"
                }))
                .via(new CallbackNode(() => {}, () => undefined, {
                    uid: "n_1"
                }))
                .via(new CallbackNode(() => {}, () => undefined, {
                    uid: "n_2"
                }))
                .to(new CallbackSinkNode((frame, options) => {
                    expect(options.sourceNode).to.equal("n_s");
                    done();
                }))
                .build().then(model =>{
                    return model.pull();
                });
        });

        it('should throw an exception when a sink node throws an error', (done) => {
            ModelBuilder.create()
                .from()
                .to(
                    new CallbackSinkNode((data: DataFrame) => {
                        throw new Error('Excepting this error');
                    }),
                )
                .build()
                .then((model) => {
                    model.push(new DataFrame());
                    model.once('error', (ex) => {
                        expect(ex).to.be.not.undefined;
                        done();
                    });
                });
        });

        it('should throw an exception when a processing node throws an error', (done) => {
            ModelBuilder.create()
                .from()
                .via(
                    new (class TestNode extends ProcessingNode<any> {
                        public process(frame: DataFrame): Promise<any> {
                            return new Promise((resolve, reject) => {
                                throw new Error('Expecting this error');
                            });
                        }
                    })(),
                )
                .to()
                .build()
                .then((model) => {
                   model.push(new DataFrame());
                   model.once('error', (ex) => {
                       expect(ex).to.be.not.undefined;
                       done();
                   });
                });
        });
        
        it('should throw an exception when a processing node rejects', (done) => {
            ModelBuilder.create()
                .from()
                .via(
                    new (class TestNode extends ProcessingNode<any> {
                        public process(frame: DataFrame): Promise<any> {
                            return new Promise((resolve, reject) => {
                                reject(new Error('Expecting this error'));
                            });
                        }
                    })(),
                )
                .to()
                .build()
                .then((model) => {
                   model.push(new DataFrame());
                   model.once('error', (ex) => {
                       expect(ex).to.be.not.undefined;
                       done();
                   });
                });
        });

        it('should resolve a push after being processed by the first node in line', (done) => {
            const resolved = [];
            ModelBuilder.create()
                .from(
                    new CallbackSourceNode(() => {
                        resolved.push(1);
                        return null;
                    }),
                )
                .via(
                    new CallbackNode(
                        () => {
                            return new Promise((resolve) => {
                                setTimeout(() => {
                                    resolved.push(2);
                                    resolve(undefined);
                                }, 1000);
                            });
                        },
                        () => {
                            resolved.push(2);
                            return null;
                        },
                    ),
                )
                .to(
                    new CallbackSinkNode(() => {
                        resolved.push(3);
                    }),
                )
                .build()
                .then((model) => {
                    model.once('completed', () => {
                        expect(resolved[0]).to.equal(2);
                        expect(resolved[1]).to.equal(3);
                        done();
                    });

                    model.push(new DataFrame()).then(() => {
                        expect(resolved.length).to.equal(0);
                    });
                });
        });
    });

    describe('pulling', () => {
        it('should pull multiple frames through the options', (done) => {
            let count = 0;
            ModelBuilder.create()
                .from(new CallbackSourceNode(() => {
                    return new DataFrame();
                }))
                .to(new CallbackSinkNode(frame => {
                    count++;
                    if (count === 3){
                        done();
                    }
                }))
                .build().then((model: Model) => {
                    return model.pull({
                        count: 3
                    });
                });
        });
    });

});
