import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    WorkerNode,
    CallbackSinkNode,
    DataObject,
    NodeDataService,
    NodeData,
    Model,
    ReferenceSpace,
    GraphBuilder,
} from '../../../src';
import * as path from 'path';
import { KeyValueDataService } from '../../../src/service/KeyValueDataService';
import { TimeConsumingNode } from '../../mock/nodes/TimeConsumingNode';

describe('WorkerNode', () => {
    // Overhead in ms
    const overhead = 50;

    before((done) => {
        done();
    });

    it('should take 30ms with 1 worker', (done) => {
        let model;
        let start;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    (builder) => {
                        // eslint-ignore-next-line
                        const { TimeConsumingNode } = require(path.join(
                            __dirname,
                            '../../mock/nodes/TimeConsumingNode',
                        ));
                        builder.via(new TimeConsumingNode());
                    },
                    {
                        directory: __dirname,
                        poolSize: 1,
                        timeout: 60000
                    },
                ),
            )
            .to(
                new CallbackSinkNode((data: DataFrame) => {
                    expect(data.getObjects()[0].uid).to.equal('time object');
                }),
            )
            .build()
            .then((m) => {
                model = m;

                // Warm-up
                return model.push(new DataFrame());
            })
            .then(() => {
                // Push three frames and wait for them to finish
                start = new Date().getTime();
                let count = 0;
                model.on('completed', () => {
                    count++;
                    if (count === 3) {
                        const end = new Date().getTime();
                        const diff = end - start;
                        if (diff >= 30 + overhead) {
                            done(new Error(`Timeout!`));
                        }
                        expect(diff).to.be.lessThan(30 + overhead);
                        model.emitAsync('destroy').then(() => {
                            done();
                        }).catch(done);
                    }
                });

                for (let i = 0; i < 3; i++) {
                    model.push(new DataFrame());
                }
            })
            .catch((ex) => {
                done(ex);
            });
    })
        .slow(20000)
        .timeout(80000);

    it('should take 20ms with 2 workers', (done) => {
        let model;
        let start;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    (builder) => {
                        const { TimeConsumingNode } = require(path.join(
                            __dirname,
                            '../../mock/nodes/TimeConsumingNode',
                        ));
                        builder.via(new TimeConsumingNode());
                    },
                    {
                        directory: __dirname,
                        poolSize: 2,
                        timeout: 60000
                    },
                ),
            )
            .to(
                new CallbackSinkNode((data: DataFrame) => {
                    expect(data.getObjects()[0].uid).to.equal('time object');
                }),
            )
            .build()
            .then((m) => {
                model = m;

                // Warm-up
                return model.push(new DataFrame());
            })
            .then(() => {
                // Push three frames and wait for them to finish
                start = new Date().getTime();
                let count = 0;
                model.on('completed', () => {
                    count++;
                    if (count === 3) {
                        const end = new Date().getTime();
                        const diff = end - start;
                        if (diff >= 20 + overhead) {
                            done(new Error(`Timeout!`));
                        }
                        expect(diff).to.be.lessThan(20 + overhead);
                        model.emitAsync('destroy').then(() => {
                            done();
                        }).catch(done);
                    }
                });

                for (let i = 0; i < 3; i++) {
                    model.push(new DataFrame());
                }
            })
            .catch((ex) => {
                done(ex);
            });
    })
        .slow(20000)
        .timeout(80000);

    it('should be able to access data services', (done) => {
        let model;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    (builder) => {
                        const { DataServiceTestNode } = require(path.join(
                            __dirname,
                            '../../mock/nodes/DataServiceTestNode',
                        ));
                        builder.via(new DataServiceTestNode());
                    },
                    {
                        directory: __dirname,
                        poolSize: 1,
                        timeout: 60000
                    },
                ),
            )
            .to(
                new CallbackSinkNode((data: DataFrame) => {
                    expect(data.getObjects()[0].uid).to.equal('abc456');
                    expect(data.getObjects()[0].displayName).to.equal('hello world');
                    model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                }),
            )
            .build()
            .then((m) => {
                model = m;
                const dataService = model.findDataService(DataObject);
                dataService.insert('abc456', new DataObject('abc456')).then(() => {
                    model.push(new DataFrame());
                });
            });
    })
        .slow(5000)
        .timeout(60000);

    it('should be able to access node data services', (done) => {
        let model;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    (builder) => {
                        const { NodeDataServiceTestNode } = require(path.join(
                            __dirname,
                            '../../mock/nodes/NodeDataServiceTestNode',
                        ));
                        builder.via(new NodeDataServiceTestNode());
                    },
                    {
                        directory: __dirname,
                        poolSize: 1,
                        timeout: 60000
                    },
                ),
            )
            .to(
                new CallbackSinkNode((data: DataFrame) => {
                    const dataService: NodeDataService<NodeData> = model.findDataService(NodeData);
                    dataService.findData('x123', 'mvdewync').then((data) => {
                        expect(data.test).to.equal('abc');
                        model.emitAsync('destroy').then(() => {
                            done();
                        }).catch(done);
                    });
                }),
            )
            .build()
            .then((m) => {
                model = m;
                model.push(new DataFrame(new DataObject('mvdewync')));
            });
    })
        .slow(5000)
        .timeout(60000);

        // it('should throw an error when missing an import', (done) => {
        //     let model;
        //     ModelBuilder.create()
        //         .from()
        //         .via(
        //             new WorkerNode(
        //                 (builder) => {
        //                     const { NodeDataServiceTestNode } = require(path.join(
        //                         __dirname,
        //                         '../../mock/nodes/NodeDataServiceTestNodeDOESNOTEXIST',
        //                     ));
        //                 },
        //                 {
        //                     directory: __dirname,
        //                     poolSize: 1,
        //                     timeout: 60000
        //                 },
        //             ),
        //         )
        //         .to(
        //             new CallbackSinkNode(() => {
        //                 done();
        //             }),
        //         )
        //         .build()
        //         .then((m) => {
        //             model = m;
        //             model.push(new DataFrame(new DataObject('mvdewync')));
        //         }).catch(() => done());
        // })
        //     .slow(5000)
        //     .timeout(60000);

    it('should support error events', (done) => {
        let model;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    (builder) => {
                        const { ErrorThrowingNode } = require(path.join(
                            __dirname,
                            '../../mock/nodes/ErrorThrowingNode',
                        ));
                        builder.via(new ErrorThrowingNode());
                    },
                    {
                        directory: __dirname,
                        poolSize: 1,
                        timeout: 60000
                    },
                ),
            )
            .to()
            .build()
            .then((m) => {
                model = m;
                model.once('error', (event) => {
                    model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                });
                model.push(new DataFrame(new DataObject('mvdewync')));
            });
    })
        .slow(5000)
        .timeout(60000);

    it('should support completed events', (done) => {
        let model;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    (builder) => {
                        const { TimeConsumingNode } = require(path.join(
                            __dirname,
                            '../../mock/nodes/TimeConsumingNode',
                        ));
                        builder.via(new TimeConsumingNode());
                    },
                    {
                        directory: __dirname,
                        poolSize: 1,
                        timeout: 60000
                    },
                ),
            )
            .to(new CallbackSinkNode((data: DataFrame) => {}))
            .build()
            .then((m) => {
                model = m;
                model.once('completed', (event) => {
                    model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                });
                model.push(new DataFrame(new DataObject('mvdewync')));
            });
    })
        .slow(5000)
        .timeout(60000);

    it('should support node workerserialization', (done) => {
        let model;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    new TimeConsumingNode(),
                    {
                        directory: __dirname,
                        poolSize: 1,
                        imports: [
                            path.join(
                                __dirname,
                                '../../mock/nodes/TimeConsumingNode',
                            )
                        ],
                        timeout: 60000,
                    },
                ),
            )
            .to(new CallbackSinkNode((data: DataFrame) => {}))
            .build()
            .then((m) => {
                model = m;
                model.once('error', done);
                model.once('completed', (event) => {
                    model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                });
                model.push(new DataFrame(new DataObject('mvdewync')));
            }).catch(done);
    })
        .slow(5000)
        .timeout(60000);

    // it('should support node workerserialization on a graph', (done) => {
    //     let model;
    //     ModelBuilder.create()
    //         .from()
    //         .via(
    //             new WorkerNode(
    //                 GraphBuilder.create()
    //                     .from()
    //                     .via(new TimeConsumingNode())
    //                     .to(),
    //                 {
    //                     directory: __dirname,
    //                     poolSize: 1,
    //                     imports: [
    //                         path.join(
    //                             __dirname,
    //                             '../../mock/nodes/TimeConsumingNode',
    //                         )
    //                     ],
    //                     timeout: 60000,
    //                 },
    //             ),
    //         )
    //         .to(new CallbackSinkNode((data: DataFrame) => {}))
    //         .build()
    //         .then((m) => {
    //             model = m;
    //             model.once('error', done);
    //             model.once('completed', (event) => {
    //                 model.emitAsync('destroy').then(() => {
    //                     done();
    //                 }).catch(done);
    //             });
    //             model.push(new DataFrame(new DataObject('mvdewync')));
    //         }).catch(done);
    // })
    //     .slow(5000)
    //     .timeout(60000);

    it('should support custom methods', (done) => {
        let model;
        ModelBuilder.create()
            .from()
            .via(
                new WorkerNode(
                    new TimeConsumingNode(),
                    {
                        uid: "worker",
                        directory: __dirname,
                        poolSize: 1,
                        imports: [
                            path.join(
                                __dirname,
                                '../../mock/nodes/TimeConsumingNode',
                            )
                        ],
                        timeout: 60000,
                        methods: [{
                            name: "test1",
                            handler: (model: Model, ...args: any[]) => {
                                model.logger("info", "test1");
                            }
                        },
                        {
                            name: "test2",
                            handler: (model: Model, ...args: any[]) => {
                                return model.referenceSpace;
                            }
                        },
                        {
                            name: "test3",
                            handler: (model: Model, object: DataObject) => {
                                return object.uid === "maxim";
                            }
                        }]
                    },
                ),
            )
            .to(new CallbackSinkNode((data: DataFrame) => {}))
            .build()
            .then((m) => {
                model = m;
                model.once('error', done);
                model.once('completed', () => {
                    const worker: WorkerNode<any, any> = model.findNodeByUID("worker");
                    worker.invokeMethod("test1").then(() => {
                        return worker.invokeMethod("test2");
                    }).then(data => {
                        expect(data).to.be.instanceOf(ReferenceSpace);
                        return worker.invokeMethod("test3", new DataObject("maxim"));
                    }).then((data) => {
                        expect(data).to.be.true;
                        return model.emitAsync('destroy');
                    }).then(() => {
                        done();
                    }).catch(done);
                });
                model.push(new DataFrame(new DataObject('mvdewync')));
            }).catch(done);
    })
        .slow(5000)
        .timeout(60000);
});

describe('worker graph', () => {
    it('should build a graph or node from a file', (done) => {
        ModelBuilder.create()
            .addNode(
                new WorkerNode('../../mock/ExampleGraph', {
                    name: 'output',
                    directory: __dirname,
                    poolSize: 2,
                    timeout: 60000
                }),
            )
            .from('output')
            .to(
                new CallbackSinkNode(function (frame) {
                    expect(frame).to.not.be.undefined;
                    expect(frame.source).to.not.be.undefined;
                    expect(frame.source.uid).to.be.equal('mvdewync');
                    this.model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                }),
            )
            .build()
            .then((model) => {
                model.once('error', (ex) => {
                    model.destroy();
                    done(ex);
                });
                model.pull();
            })
            .catch(done);
    })
        .slow(8000)
        .timeout(60000);

    it('should build a graph or node from a file that acts as a worker', (done) => {
        ModelBuilder.create()
            .addNode(
                new WorkerNode(undefined, {
                    name: 'output',
                    directory: __dirname,
                    poolSize: 2,
                    worker: '../../test/mock/ExampleWorker',
                    timeout: 60000
                }),
            )
            .from('output')
            .to(
                new CallbackSinkNode(function (frame) {
                    expect(frame).to.not.be.undefined;
                    expect(frame.source).to.not.be.undefined;
                    expect(frame.source.uid).to.be.equal('mvdewync');
                    this.model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                }),
            )
            .build()
            .then((model) => {
                model.once('error', (ex) => {
                    model.destroy();
                    done(ex);
                });
                model.pull();
            })
            .catch(done);
    })
        .slow(8000)
        .timeout(60000);

    it('should build a model from a file using a main service', (done) => {
        ModelBuilder.create()
            .addService(new KeyValueDataService('abc123'))
            .addNode(
                new WorkerNode('../../mock/ExampleModel', {
                    name: 'output',
                    directory: __dirname,
                    poolSize: 2,
                    timeout: 60000
                }),
            )
            .from('output')
            .to(
                new CallbackSinkNode(function (frame) {
                    expect(frame).to.not.be.undefined;
                    expect(frame.source).to.not.be.undefined;
                    expect(frame.source.uid).to.be.equal('mvdewync');
                    expect(frame.source.displayName).to.equal('abc');
                    this.model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                }),
            )
            .build()
            .then((model) => {
                const service = model.findDataService('abc123');
                service
                    .setValue('displayName', 'abc')
                    .then(() => {
                        model.pull();
                    })
                    .catch(done);
            });
    })
        .slow(8000)
        .timeout(60000);

    it('should build a model from a file using a worker service', (done) => {
        ModelBuilder.create()
            .addNode(
                new WorkerNode('../../mock/ExampleModel2', {
                    name: 'output',
                    directory: __dirname,
                    poolSize: 1,
                    timeout: 60000
                }),
            )
            .from('output')
            .to(
                new CallbackSinkNode(function (frame) {
                    expect(frame).to.not.be.undefined;
                    expect(frame.source).to.not.be.undefined;
                    expect(frame.source.uid).to.be.equal('mvdewync');
                    expect(frame.source.displayName).to.equal('maxim');
                    this.model.emitAsync('destroy').then(() => {
                        done();
                    }).catch(done);
                }),
            )
            .build()
            .then((model) => {
                const service = model.findDataService('test123');
                service
                    .setValue('displayName', 'maxim')
                    .then(() => {
                        model.pull();
                    })
                    .catch(done);
            })
            .catch(done);
    })
        .slow(8000)
        .timeout(60000);
});
