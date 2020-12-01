import { Suite } from 'benchmark';
import { Absolute3DPosition, AngularVelocity, CallbackSinkNode, DataFrame, DataObject, GraphBuilder, LinearVelocity, LoggingSinkNode, Model, ModelBuilder, Quaternion, TimeService, VelocityProcessingNode, WorkerNode } from '../../src';
import * as path from 'path';
import { ComputingNode } from '../mock/nodes/ComputingNode';
import Benchmark = require('benchmark');
import * as fs from 'fs';

const size = parseInt(process.argv[2]);
const minSamples = parseInt(process.argv[3]);

const frames: DataFrame[] = new Array();
const suite = new Suite();
const settings: Benchmark.Options = {
    defer: true,
    minSamples,
    initCount: 5,
    delay: 2
};
const settingsCreate: Benchmark.Options = {
    defer: true,
    minSamples: 1
};
let model: Model;

async function init() {
    for (let i = 0 ; i < 100 ; i++) {
        const dummyFrame = new DataFrame();
        const dummyObject = new DataObject("dummy", "Dummy Data Object");
        const position = new Absolute3DPosition(0, 0, 0);
        position.velocity.linear = new LinearVelocity(0.1, 0.1, 0.1);
        position.velocity.angular = new AngularVelocity(0.1, 0.1, 0.1);
        position.orientation = new Quaternion(0, 0, 0, 1);
        dummyObject.setPosition(position);
        dummyFrame.source = dummyObject;
        dummyFrame.addObject(dummyObject);
        frames.push(dummyFrame);
    }
}

function createModel(workers: number): Promise<Model> {
    return new Promise((resolve, reject) => {
        let model: Model;
        ModelBuilder.create()
            .addShape(GraphBuilder.create()
                .from()
                .via(new WorkerNode((builder, modelBuilder, args) => {
                    const { ComputingNode } = require(path.join(__dirname, '../mock/nodes/ComputingNode'));
                    builder.via(new ComputingNode(args.size));
                }, {
                    poolSize: workers,
                    poolConcurrency: parseInt(process.argv[4]),
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
                resolve(model);
            }).catch(ex => {
                reject(ex);
            });
    });
}

function testFunction(model: Model, deferred: any): void {
    let promises = new Array();
    frames.forEach(frame => {
        promises.push(model.push(frame));
    });
    const sink = model.getNodeByUID("sink") as CallbackSinkNode<any>;
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
    .add("worker#computenode", (deferred: any) => {
        const sink = model.getNodeByUID("sink") as CallbackSinkNode<any>;
        sink.callback = (frame) => {
            deferred.resolve();
        };
        Promise.resolve(model.push(frames[0]));
    }, {
        minSamples: 10,
        defer: true
    })
    .add("worker#none", (deferred: any) => {
        testFunction(model, deferred);
    }, {
        onComplete: () => {
            model.emit('destroy');
        },
        ...settings
    });
    for (let i = 1 ; i <= parseInt(process.argv[5]) ; i++) {
        suite.add(`worker#${i}-create`, (deferred: any) => {
            if (model !== undefined && model.name == `${i}`)
                return deferred.resolve();
            createModel(i).then((m: Model) => {
                model = m;
                model.name = `${i}`;
                deferred.resolve();
            });
        }, settingsCreate)
        .add(`worker#${i}`, (deferred: any) => {
            testFunction(model, deferred);
        }, {
            onComplete: () => {
                model.emit('destroy');
                model = undefined;
            },
            ...settings
        })
    }
    suite.on('cycle', function(event: any) {
        console.log(String(event.target));
    }).on('complete', function () {
        for (let i = 1; i < this.length; i += 2) {
            fs.writeFileSync("benchmark_" + Date.now() + ".json", JSON.stringify(this[i], null, 4))
        }
    })
    .run();    
});
