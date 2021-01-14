import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataFrame, WorkerNode, CallbackSinkNode, DataObject, Model, NodeDataService, NodeData } from '../../../src';
import * as path from 'path';

describe('node', () => {
    describe('worker node', () => {
        // Overhead in ms
        const overhead = 25;

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
                            expect(diff).to.be.lessThan(30 + overhead);
                            model.emit('destroy');
                            done();
                        }
                    });

                    for (let i = 0 ; i < 3 ; i ++){
                        model.push(new DataFrame());
                    }
                })
                .catch((ex) => {
                    done(ex);
                });
        }).slow(5000);

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
                            poolSize: 2
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
                            expect(diff).to.be.lessThan(20 + overhead);
                            model.emit('destroy');
                            done();
                        }
                    });

                    for (let i = 0 ; i < 3 ; i ++){
                        model.push(new DataFrame());
                    }
                })
                .catch((ex) => {
                    done(ex);
                });
        }).slow(5000);

        it('should take 10ms with 3 workers', (done) => {
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
                            poolSize: 3,
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
                            expect(diff).to.be.lessThan(10 + overhead);
                            model.emit('destroy');
                            done();
                        }
                    });

                    for (let i = 0 ; i < 3 ; i ++){
                        model.push(new DataFrame());
                    }
                })
                .catch((ex) => {
                    done(ex);
                });
        }).slow(5000);

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
                        },
                    ),
                )
                .to(
                    new CallbackSinkNode((data: DataFrame) => {
                        expect(data.getObjects()[0].uid).to.equal('abc456');
                        expect(data.getObjects()[0].displayName).to.equal('hello world');
                        model.emit('destroy');
                        done();
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
        }).slow(5000);

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
                        },
                    ),
                )
                .to(
                    new CallbackSinkNode((data: DataFrame) => {
                        const dataService: NodeDataService<NodeData> = model.findDataService(NodeData);
                        dataService.findData("x123", "mvdewync").then(data => {
                            expect(data.test).to.equal("abc");
                            model.emit('destroy');
                            done();
                        });
                    }),
                )
                .build()
                .then((m) => {
                    model = m;
                    model.push(new DataFrame(new DataObject("mvdewync")));
                });
        }).slow(5000);

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
                        },
                    ),
                )
                .to()
                .build()
                .then((m) => {
                    model = m;
                    model.once('error', event => {
                        model.destroy();
                        done();
                    })
                    model.push(new DataFrame(new DataObject("mvdewync")));
                });
        }).slow(5000);

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
                        },
                    ),
                )
                .to(
                    new CallbackSinkNode((data: DataFrame) => {
                        
                    }),
                )
                .build()
                .then((m) => {
                    model = m;
                    model.once('completed', event => {
                        model.destroy();
                        done();
                    })
                    model.push(new DataFrame(new DataObject("mvdewync")));
                });
        }).slow(5000);
    });

    describe('worker graph', () => {

        it('should build a graph or node from a file', (done) => {
            ModelBuilder.create()
                .addNode(new WorkerNode("../../mock/ExampleGraph", {
                    name: "output",
                    directory: __dirname,
                    poolSize: 4
                }))
                .from("output")
                .to(new CallbackSinkNode(function(frame) {
                    expect(frame).to.not.be.undefined;
                    expect(frame.source).to.not.be.undefined;
                    expect(frame.source.uid).to.be.equal("mvdewync");
                    this.model.destroy();
                    done();
                }))
                .build().then(model => {
                    model.pull();
                });
        }).slow(8000).timeout(30000);

    });
});
