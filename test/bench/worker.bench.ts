import { Suite } from 'benchmark';
import { Absolute3DPosition, AngularVelocity, DataFrame, DataObject, GraphBuilder, LinearVelocity, LoggingSinkNode, Model, ModelBuilder, Quaternion, TimeService, VelocityProcessingNode, WorkerNode } from '../../src';
import * as path from 'path';
import { ComputingNode } from '../mock/nodes/ComputingNode';
import Benchmark = require('benchmark');

const models = new Array();
const frames: DataFrame[] = new Array();
const suite = new Suite();
const settings: Benchmark.Options = {
    defer: true,
    minSamples: 50,
    initCount: 2
};

async function init() {
    models.push(await ModelBuilder.create()
        .addShape(GraphBuilder.create()
            .from()
            .via(new ComputingNode(1000))
            .to(new LoggingSinkNode()))
        .build());
    for (let i = 0 ; i < 8 ; i++) {
        models.push(await createModel(i + 1));
    }
    
    for (let i = 0 ; i < 20 ; i++) {
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
                    const ComputingNode = require(path.join(__dirname, '../mock/nodes/ComputingNode')).ComputingNode;
                    builder.via(new ComputingNode(1000));
                }, {
                    poolSize: workers,
                    directory: __dirname,
                    services: []
                }))
                .to(new LoggingSinkNode()))
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
    Promise.all(promises).then(() => {
        deferred.resolve();
    }).catch(ex => {
        console.log(ex);
        deferred.resolve();
    });
}

init().then(() => {
    console.log("Initialized! Starting benchmarks ...");

    suite.add("worker#none", (deferred: any) => {
        testFunction(models[0], deferred);
    }, settings)
    .add("worker#1", (deferred: any) => {
        testFunction(models[1], deferred);
    }, settings)
    .add("worker#2", (deferred: any) => {
        testFunction(models[2], deferred);
    }, settings)
    .add("worker#3", (deferred: any) => {
        testFunction(models[3], deferred);
    }, settings)
    .add("worker#4", (deferred: any) => {
        testFunction(models[4], deferred);
    }, settings)
    .add("worker#5", (deferred: any) => {
        testFunction(models[5], deferred);
    }, settings)
    .add("worker#6", (deferred: any) => {
        testFunction(models[6], deferred);
    }, settings)
    .add("worker#7", (deferred: any) => {
        testFunction(models[7], deferred);
    }, settings)
    .add("worker#8", (deferred: any) => {
        testFunction(models[8], deferred);
    }, settings)
    .on('cycle', function(event: any) {
        console.log(String(event.target));
    })
    .run();    
});
