import { Suite } from 'benchmark';
import { Absolute3DPosition, AngularVelocity, DataFrame, DataObject, GraphBuilder, LinearVelocity, LoggingSinkNode, Model, ModelBuilder, VelocityProcessingNode, WorkerNode } from '../../src';
import * as path from 'path';

const models = new Array();
const frames: DataFrame[] = new Array();
const suite = new Suite();
const settings = {
    defer: true,
    minSamples: 10,
    initCount: 10
};

async function init() {
    models.push(await ModelBuilder.create()
        .addShape(GraphBuilder.create()
            .from()
            .via(new VelocityProcessingNode())
            .to(new LoggingSinkNode()))
        .build());
    for (let i = 0 ; i < 8 ; i++) {
        models.push(await createModel(i + 1));
    }
    
    for (let i = 0 ; i < 100 ; i++) {
        const dummyFrame = new DataFrame();
        const dummyObject = new DataObject("dummy data object");
        const position = new Absolute3DPosition(0, 0, 0);
        position.velocity.linear = new LinearVelocity(0.1, 0.1, 0.1);
        position.velocity.angular = new AngularVelocity(0.1, 0.1, 0.1);
        dummyObject.setPosition(position);
        dummyFrame.addObject(dummyObject);
        frames.push(dummyFrame);
    }
}

function createModel(workers: number): Promise<Model> {
    return new Promise((resolve, reject) => {
        ModelBuilder.create()
            .addShape(GraphBuilder.create()
                .from()
                .via(new WorkerNode((builder) => {
                    const VelocityProcessingNode = require(path.join(__dirname, '../../src')).VelocityProcessingNode;
                    builder.via(new VelocityProcessingNode());
                }, {
                    poolSize: workers,
                    directory: __dirname,
                }))
                .to(new LoggingSinkNode()))
            .build().then((model: Model) => {
                resolve(model);
            }).catch(ex => {
                reject(ex);
            });
    });
}

function testFunction(model: Model, deferred: any): void {
    const pushPromises = new Array();
    frames.forEach(frame => {
        pushPromises.push(model.push(frame));
    });
    Promise.all(pushPromises).then(() => {
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
        console.log(event.target.name);
        console.log(event.target.stats.rme);
        console.log(event.target.stats.sample.length);
        console.log(event.target.count); // The number of times a test was executed.
        console.log(event.target.cycles); // The number of cycles performed while benchmarking.
        console.log(event.target.hz); //The number of executions per second.
    })
    .on('complete', function() {
        for (var i = 0; i < this.length; i++) {
            console.log(this[i].hz + " ops/sec");
            console.log(this[i].stats.sample.length);
        }
    })
    .run();    
});
