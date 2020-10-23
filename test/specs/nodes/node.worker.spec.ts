import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataFrame, WorkerNode, CallbackSinkNode, DataObject } from '../../../src';
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
                            debug: true,
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
                    return Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]);
                })
                .then(() => {
                    const end = new Date().getTime();
                    const diff = end - start;
                    expect(diff).to.be.lessThan(30 + overhead);
                    model.emit('destroy');
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        }).timeout(30000);

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
                            debug: true,
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
                    return Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]);
                })
                .then(() => {
                    const end = new Date().getTime();
                    const diff = end - start;
                    expect(diff).to.be.lessThan(20 + overhead);
                    model.emit('destroy');
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        }).timeout(30000);

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
                            debug: true,
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
                    return Promise.all([
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                        model.push(new DataFrame()),
                    ]);
                })
                .then(() => {
                    const end = new Date().getTime();
                    const diff = end - start;
                    expect(diff).to.be.lessThan(10 + overhead);
                    model.emit('destroy');
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        }).timeout(30000);

        it('should be able to access services', (done) => {
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
                            debug: true,
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
                        Promise.resolve(model.push(new DataFrame()));
                    });
                });
        }).timeout(50000);
    });
});
