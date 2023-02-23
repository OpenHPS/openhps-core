import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    Node,
    GraphBuilder,
    CallbackSourceNode,
    CallbackNode,
    CallbackSinkNode,
    ProcessingNode,
    Model,
    Edge,
    FrameMergeNode,
    DataObject,
    TimeService,
    DataObjectService,
    MemoryDataService,
    DataService,
    DataSerializer,
    ModelSerializer,
} from '../../src';
import { BroadcastNode } from '../../src/nodes/shapes/BroadcastNode';
import { PlaceholderNode } from '../../src/nodes/_internal/PlaceholderNode';
import { DataServiceProxy } from '../../src/service/_internal';
import { DummyDataObject } from '../mock/data/object/DummyDataObject';
import { DummySensorObject } from '../mock/data/object/DummySensorObject';

describe('Model', () => {
    describe('serializer', () => {
        it('should serialize a model', (done) => {
             
            ModelBuilder.create()
                .from()
                .to()
                .build()
                .then((model) => {
                //    const serialized = ModelSerializer.serialize(model);
                    // const deserialized = ModelSerializer.deserialize(serialized);
                    // expect(model.uid).to.equal(deserialized.uid);
                    // expect(model.nodes.length).to.equal(deserialized.nodes.length);
                    // expect(model.edges.length).to.equal(deserialized.edges.length);
                    // expect(model.nodes).to.eql(deserialized.nodes);
                    done();
                }).catch(done);
        }).timeout(60000);
    });

    describe('service', () => {
        it('should be possible to get the datatype of a proxied service', () => {
            let service = new DataObjectService(new MemoryDataService(DummySensorObject));
            expect(service.dataType).to.equal(DummySensorObject);
            service = new Proxy(service, new DataServiceProxy());
            expect(service.dataType).to.equal(DummySensorObject);
        });

        it('should be able to find services by class', async () => {
            const model: Model = await ModelBuilder.create()
                .addService(new DataObjectService(new MemoryDataService(DataObject)))
                .addService(new DataObjectService(new MemoryDataService(DummySensorObject)))
                .from()
                .to()
                .build();
            const services1 = model.findAllServices();
            const services2 = model.findAllServices(DataObjectService);
            expect(services1.length).to.equal(5);
            expect(services2.length).to.equal(3);
        });

        it('should be able to find data services by class', async () => {
            const model: Model = await ModelBuilder.create()
                .addService(new DataObjectService(new MemoryDataService(DataObject)))
                .addService(new DataObjectService(new MemoryDataService(DummySensorObject)))
                .from()
                .to()
                .build();
            const service = model.findDataService(DataObjectService);
            expect(service).to.not.be.undefined;
        });

        describe('find data services', () => {
            it('should be able to find by data type', async () => {
                const model: Model = await ModelBuilder.create()
                    .addService(new DataObjectService(new MemoryDataService(DataObject)))
                    .addService(new DataObjectService(new MemoryDataService(DummySensorObject)))
                    .from()
                    .to()
                    .build();
                const services: Array<DataService<any, any>> = model.findAllDataServices(DummySensorObject);
                expect(services).to.not.be.undefined;
                expect(services.length).to.equal(2);
                expect(services[0].dataType).to.equal(DummySensorObject);
            });

            it('should be able to find by data type sorted by specificity', async () => {
                const model: Model = await ModelBuilder.create()
                    .addService(new DataObjectService(new MemoryDataService(DataObject)))
                    .addService(new DataObjectService(new MemoryDataService(DummyDataObject)))
                    .addService(
                        new DataObjectService(new MemoryDataService(DummySensorObject)).setPriority(20).setUID('abc'),
                    )
                    .addService(
                        new DataObjectService(new MemoryDataService(DummySensorObject)).setPriority(10).setUID('123'),
                    )
                    .from()
                    .to()
                    .build();
                const services: Array<DataService<any, any>> = model.findAllDataServices(DummySensorObject);
                expect(services).to.not.be.undefined;
                expect(services.length).to.equal(4);
                expect(services[0].dataType).to.equal(DummySensorObject);
                expect(services[0].priority).to.equal(20);
                expect(services[1].priority).to.equal(10);
                expect(services[2].dataType).to.equal(DummyDataObject);
            });

            it('should be able to find by data type', async () => {
                const model: Model = await ModelBuilder.create()
                    .addService(new DataObjectService(new MemoryDataService(DataObject)))
                    .from()
                    .to()
                    .build();
                const service = model.findDataService(DummySensorObject);
                expect(service).to.not.be.undefined;
            });

            it('should determine instanceof with priority', () => {
                let result;
                result = instanceofPriority(DummySensorObject, DataObject);
                expect(result[0]).to.be.true;
            });

            /**
             * @param obj
             * @param constr
             */
            function instanceofPriority(obj: any, constr: any): [boolean, number] {
                if (obj === constr) {
                    return [true, 0];
                }
                let level = 1;
                while ((obj = Object.getPrototypeOf(obj))) {
                    if (obj === constr) {
                        return [true, level];
                    }
                    level++;
                }
                return [false, undefined];
            }
        });
    });

    describe('builder', () => {
        it('should support pushing without building', (done) => {
            const builder = GraphBuilder.create()
                .from()
                .via(
                    new CallbackNode(() => {
                        done();
                    }),
                )
                .to();
            builder.graph.push(new DataFrame());
        });

        it('should support graphs as nodes', (done) => {
            GraphBuilder.create()
                .from()
                .to()
                .build()
                .then((graph) => {
                    ModelBuilder.create()
                        .from()
                        .via(graph)
                        .to()
                        .build()
                        .then((model) => {
                            done();
                        })
                        .catch(done);
                });
        });

        it('should support graphbuilders as nodes', (done) => {
            ModelBuilder.create()
                .from()
                .via(
                    GraphBuilder.create()
                        .from()
                        .via(
                            new CallbackNode(() => {
                                done();
                            }),
                        )
                        .to(),
                )
                .to()
                .build()
                .then((model) => {
                    model.push(new DataFrame());
                })
                .catch(done);
        });

        it('should support loggers', (done) => {
            ModelBuilder.create()
                .withLogger((level, log) => {
                    expect(level).to.equal('debug');
                    expect(log).to.equal('test');
                    done();
                })
                .build()
                .then((model) => {
                    model.logger('debug', 'test');
                });
        });

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
                .via(new PlaceholderNode('1'))
                .via(new PlaceholderNode('2.1'), new PlaceholderNode('2.2'), new PlaceholderNode('2.3'))
                .via(new PlaceholderNode('3'))
                .to()
                .build()
                .then((model) => {
                    done();
                });
        });

        it('should reject building when node rejects build', (done) => {
            ModelBuilder.create()
                .from()
                .via(new PlaceholderNode('1'))
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
                .via(new PlaceholderNode('3'))
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
                .addNode(new PlaceholderNode('1'))
                .addNode(new PlaceholderNode('2'))
                .addNode(new PlaceholderNode('3'))
                .addNode(new PlaceholderNode('4'))
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
                .addShape(
                    GraphBuilder.create()
                        .addNode(new PlaceholderNode('1'))
                        .addNode(new PlaceholderNode('2'))
                        .addNode(new PlaceholderNode('3'))
                        .addNode(new PlaceholderNode('4')),
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
                .addShape(
                    GraphBuilder.create()
                        .addNode(new PlaceholderNode('1'))
                        .addNode(new PlaceholderNode('2'))
                        .addNode(new PlaceholderNode('3'))
                        .addNode(new PlaceholderNode('4')),
                )
                .addShape(GraphBuilder.create().from().via('1').via('2', '3').to())
                .addShape(GraphBuilder.create().from('1').via('4').to())
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
                .addShape(GraphBuilder.create().from().via('1').via('2', '3').to())
                .addShape(GraphBuilder.create().from('1').via('4').to())
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
                .addShape(GraphBuilder.create().from().via(new PlaceholderNode('1'), new PlaceholderNode('2')).to())
                .build()
                .then((model) => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should be able to take unbuild model shapes', (done) => {
            ModelBuilder.create()
                .addShape(
                    ModelBuilder.create()
                        .addService(new TimeService())
                        .from()
                        .via(new PlaceholderNode('1'), new PlaceholderNode('2'))
                        .to(),
                )
                .build()
                .then((model) => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should be able to take build model shapes', (done) => {
            ModelBuilder.create()
                .addService(new TimeService())
                .from()
                .via(new PlaceholderNode('1'), new PlaceholderNode('2'))
                .to()
                .build()
                .then((m1: Model) => {
                    ModelBuilder.create()
                        .addShape(m1)
                        .build()
                        .then((model) => {
                            done();
                        })
                        .catch((ex) => {
                            done(ex);
                        });
                });
        });

        it('should support multiple services', async () => {
            const model: Model = await ModelBuilder.create()
                .addServices(
                    new DataObjectService(new MemoryDataService(DataObject)),
                    new DataObjectService(new MemoryDataService(DummySensorObject)),
                )
                .from()
                .to()
                .build();
            const services1 = model.findAllServices();
            const services2 = model.findAllServices(DataObjectService);
            expect(services1.length).to.equal(5);
            expect(services2.length).to.equal(3);
        });
    });

    describe('graph builder', () => {
        it('should support adding nodes and edges manually', (done) => {
            const node1 = new PlaceholderNode('1');
            const node2 = new PlaceholderNode('2');
            GraphBuilder.create()
                .addNode(node1)
                .addNode(node2)
                .addEdge(new Edge(node1, node2))
                .build()
                .then((graph) => {
                    done();
                });
        });
    });

    describe('pushing', () => {
        it('should support pushing to placeholders', (done) => {
            ModelBuilder.create()
                .addShape(
                    GraphBuilder.create()
                        .from('in-a')
                        .clone()
                        .via(
                            new CallbackNode((frame) => {
                                frame.uid = 'a';
                            }),
                        )
                        .to('a'),
                )
                .addShape(
                    GraphBuilder.create()
                        .from('in-b')
                        .clone()
                        .via(
                            new CallbackNode((frame) => {
                                frame.uid = 'b';
                            }),
                        )
                        .to('b'),
                )
                .addShape(
                    GraphBuilder.create()
                        .from('in-c')
                        .clone()
                        .via(
                            new CallbackNode((frame) => {
                                frame.uid = 'c';
                            }),
                        )
                        .to('c'),
                )
                .from('a', 'b', 'c')
                .to(
                    new CallbackSinkNode((frame) => {
                        expect(frame.uid).to.equal('b');
                        done();
                    }),
                )
                .build()
                .then((model) => {
                    const frame = new DataFrame(new DataObject('test'));
                    model.onceCompleted(frame.uid).then(() => {
                        model.destroy();
                        expect(frames).to.equal(1);
                        done();
                    });
                    model.findNodeByName('in-b').push(frame);
                });
        });

        it('should support multiple shape pushing', (done) => {
            let frames = 0;
            ModelBuilder.create()
                .addShape(GraphBuilder.create().from().clone().to('a'))
                .addShape(GraphBuilder.create().from().clone().to('b'))
                .addShape(GraphBuilder.create().from().clone().to('c'))
                .from('a', 'b', 'c')
                .via(
                    new FrameMergeNode(
                        (frame) => frame.source.uid,
                        (frame, options) => options.lastNode,
                        {
                            timeout: 100,
                            minCount: 1,
                        },
                    ),
                )
                .to(
                    new CallbackSinkNode((frame) => {
                        frames++;
                    }),
                )
                .build()
                .then((model) => {
                    const frame = new DataFrame(new DataObject('test'));
                    model.onceCompleted(frame.uid).then(() => {
                        model.destroy();
                        expect(frames).to.equal(1);
                        done();
                    });
                    model.push(frame);
                });
        });

        it('should store the source in the options', (done) => {
            ModelBuilder.create()
                .from(
                    new CallbackSourceNode(
                        () => {
                            return new DataFrame();
                        },
                        {
                            uid: 'n_s',
                        },
                    ),
                )
                .via(
                    new CallbackNode(
                        () => {},
                        () => undefined,
                        {
                            uid: 'n_1',
                        },
                    ),
                )
                .via(
                    new CallbackNode(
                        () => {},
                        () => undefined,
                        {
                            uid: 'n_2',
                        },
                    ),
                )
                .to(
                    new CallbackSinkNode((frame, options) => {
                        expect(options.sourceNode).to.equal('n_s');
                        done();
                    }),
                )
                .build()
                .then((model) => {
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

        it('should throw an exception when a graph shape node throws an error', (done) => {
            ModelBuilder.create()
                .addShape(
                    GraphBuilder.create()
                        .from()
                        .via(
                            new CallbackSinkNode((data: DataFrame) => {
                                throw new Error('Excepting this error');
                            }),
                        )
                        .to('a'),
                )
                .from('a')
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
                .from(
                    new CallbackSourceNode(() => {
                        return new DataFrame();
                    }),
                )
                .to(
                    new CallbackSinkNode((frame) => {
                        count++;
                        if (count === 3) {
                            done();
                        }
                    }),
                )
                .build()
                .then((model: Model) => {
                    return model.pull({
                        count: 3,
                    });
                });
        });
    });

    describe('model builder events', () => {
        it('should support a "postbuild" event', (done) => {
            ModelBuilder.create()
                .on('postbuild', (model: any) => {
                    expect(model).to.not.be.undefined;
                    done();
                })
                .build();
        });

        it('should support a "prebuild" event', (done) => {
            ModelBuilder.create()
                .on('prebuild', () => {
                    done();
                })
                .build();
        });
    });

    describe('onceCompleted()', () => {
        it('should support a completed event', (done) => {
            ModelBuilder.create()
                .from()
                .store()
                .build().then(model => {
                    const frame = new DataFrame();
                    model.onceCompleted(frame.uid).then(() => {
                        done();
                    }).catch(done);
                    model.push(frame);
                });
        }).timeout(2000);

        it('should support a completed event on a graph shape', (done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .from("input")
                    .store())
                .build().then(model => {
                    const frame = new DataFrame();
                    model.findNodeByName("input").onceCompleted(frame.uid).then(() => {
                        done();
                    }).catch(done);
                    model.findNodeByName("input").push(frame);
                });
        }).timeout(2000);
    });
});
