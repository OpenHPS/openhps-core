import { Suite } from 'benchmark';
import { 
    Absolute3DPosition, 
    AngularVelocity, 
    CallbackSinkNode, 
    DataFrame, 
    DataObject, 
    GraphBuilder, 
    LinearVelocity, 
    Model,
    ModelBuilder, 
    Orientation,
    WorkerNode 
} from '../../src';
import * as path from 'path';
import { ComputingNode } from '../mock/nodes/ComputingNode';
import * as Benchmark from 'benchmark';
import * as fs from 'fs';

const sizes: number[] = [5000, 10000, 15000];

let promise: Promise<void> = Promise.resolve();

for (let i = 0 ; i < sizes.length ; i++) {
    const size = sizes[i];
    const minSamples = parseInt(process.argv[2]);
    const workerCount = parseInt(process.argv[3]);
    const concurrency = parseInt(process.argv[4]);

    promise = promise.then(() => {
        return execute(size, minSamples, workerCount, concurrency);
    });
}

promise.then(() => {
    console.log("All benchmarks completed!");
}).catch((ex) => {
    console.error("An error occurred during the benchmarks:", ex);
});

function execute(size: number, minSamples: number, workerCount: number, concurrency: number): Promise<void> {
    return new Promise((resolve) => {
        console.log("Size: " + size);
        console.log("Min Samples: " + minSamples);
        console.log("Worker Count: " + workerCount);

        const frames: DataFrame[] = new Array();
        const suite = new Suite();
        const settings: Benchmark.Options = {
            defer: true,
            minSamples,
            initCount: 10,
            delay: 10
        };
        const settingsCreate: Benchmark.Options = {
            defer: true,
            minSamples: 1,
            delay: 10
        };
        let model: Model | undefined;

        async function init() {
            for (let i = 0 ; i < 100 ; i++) {
                const dummyFrame = new DataFrame();
                const dummyObject = new DataObject("dummy", "Dummy Data Object");
                const position = new Absolute3DPosition(0, 0, 0);
                position.velocity.linear = new LinearVelocity(0.1, 0.1, 0.1);
                position.velocity.angular = new AngularVelocity(0.1, 0.1, 0.1);
                position.orientation = new Orientation(0, 0, 0, 1);
                dummyObject.setPosition(position);
                dummyFrame.source = dummyObject;
                dummyFrame.addObject(dummyObject);
                frames.push(dummyFrame);
            }
        }

        function createModel(workers: number): Promise<Model> {
            return new Promise((resolve2, reject) => {
                let model: Model;
                ModelBuilder.create()
                    .addShape(GraphBuilder.create()
                        .from()
                        .via(new WorkerNode((builder, modelBuilder, args) => {
                            const { ComputingNode } = require(path.join(__dirname, '../mock/nodes/ComputingNode'));
                            builder.via(new ComputingNode(args.size));
                        }, {
                            poolSize: workers,
                            poolConcurrency: concurrency,
                            directory: __dirname,
                            services: [],
                            args: {
                                size
                            }
                        }))
                        .to(new CallbackSinkNode(() => {
                            
                        }, {
                            uid: "sink"
                        })))
                    .build().then((m: Model) => {
                        model = m;
                        return model.push(new DataFrame());
                    }).then(() => {
                        resolve2(model);
                    }).catch(ex => {
                        reject(ex);
                    });
            });
        }

        function testFunction(model: Model | undefined, deferred: any): void {
            if (model === undefined) {
                console.error("Model is undefined!");
                return deferred.resolve();
            }
            let promises = new Array();
            frames.forEach(frame => {
                promises.push(model.push(frame));
            });
            const sink = model.findNodeByUID("sink") as CallbackSinkNode<any>;
            let count = 0;
            sink.callback = (frame) => {
                count++;
                if (count === frames.length) {
                    deferred.resolve();
                }
            };
            Promise.resolve(promises);
        }

        init().then(() => {
            console.log("Initialized! Starting benchmarks ...");

            suite.add("worker#none-create", (deferred: any) => {
                if (model !== undefined && model.name == "none")
                    return deferred.resolve();
                ModelBuilder.create()
                    .addShape(GraphBuilder.create()
                        .from()
                        .via(new ComputingNode(size))
                        .to(new CallbackSinkNode(() => {

                        }, {
                            uid: "sink"
                        })))
                    .build().then((m: Model) => {
                        m.name = "none";
                        model = m;
                        deferred.resolve();
                    });
            }, settingsCreate)
            // .add("worker#computenode", (deferred: any) => {
            //     const sink = model.findNodeByUID("sink") as CallbackSinkNode<any>;
            //     sink.callback = (frame) => {
            //         deferred.resolve();
            //     };
            //     Promise.resolve(model.push(frames[0]));
            // }, {
            //     minSamples: 10,
            //     defer: true
            // })
            .add("worker#none", (deferred: any) => {
                return testFunction(model, deferred);
            }, {
                onComplete: () => {
                    if (model) {
                        model.emit('destroy');
                    }
                    model = undefined;
                },
                ...settings
            });

            for (let i = 1 ; i <= workerCount ; i++) {
                suite.add(`worker#${i}-create`, (deferred: any) => {
                    if (model !== undefined && model.name == `${i}`) {
                        return deferred.resolve();
                    }
                    createModel(i).then((m: Model) => {
                        model = m;
                        model.name = `${i}`;
                        deferred.resolve();
                    });
                }, settingsCreate)
                .add(`worker#${i}`, (deferred: any) => {
                    return testFunction(model, deferred);
                }, {
                    onComplete: () => {
                        if (model) {
                            model.emit('destroy');
                        }
                        model = undefined;
                    },
                    ...settings
                })
            }
            suite.on('cycle', function(event: any) {
                console.log(String(event.target));
            }).on('complete', function () {
                try {
                    for (let i = 0; i < this.length; i ++) {
                        const indexStr = i.toString().padStart(2, '0');
                        fs.writeFileSync(`benchmark_${size}_${indexStr}_${Date.now()}.json`, JSON.stringify(this[i], null, 4));
                    }
                } catch (ex) {
                    console.error(ex);
                }
                console.log("Benchmark completed!");
                resolve();
            })
            .run();    
        });
    });
}