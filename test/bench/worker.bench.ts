import { Suite } from 'benchmark';
import { Absolute3DPosition, AngularVelocity, CallbackSinkNode, DataFrame, DataObject, GraphBuilder, LinearVelocity, LoggingSinkNode, Model, ModelBuilder, Quaternion, TimeService, VelocityProcessingNode, WorkerNode } from '../../src';
import * as path from 'path';
import { ComputingNode } from '../mock/nodes/ComputingNode';
import Benchmark = require('benchmark');

const frames: DataFrame[] = new Array();
const suite = new Suite();
const settings: Benchmark.Options = {
    defer: true,
    minSamples: 100,
    initCount: 5,
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
                .via(new WorkerNode((builder, modelBuilder) => {
                    const { ComputingNode } = require(path.join(__dirname, '../mock/nodes/ComputingNode'));
                    builder.via(new ComputingNode(20000));
                }, {
                    poolSize: workers,
                    poolConcurrency: 10,
                    directory: __dirname,
                    services: []
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
                .via(new ComputingNode(20000))
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
    .add("worker#none", (deferred: any) => {
        testFunction(model, deferred);
    }, {
        onComplete: () => {
            model.emit('destroy');
        },
        ...settings
    });
    for (let i = 1 ; i <= 16 ; i++) {
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
            },
            ...settings
        })
    }
    suite.on('cycle', function(event: any) {
            console.log(String(event.target));
        })
        .run({ async: true });    
});
