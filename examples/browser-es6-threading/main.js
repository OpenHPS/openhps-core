import { ModelBuilder, DataSerializer, ReferenceSpace, WorkerNode, CallbackSinkNode, DataFrame } from '../common/openhps-core.es.js';
import { Building } from '../common/openhps-geospatial.es.js';
import { CameraObject } from '../common/openhps-video.es.js';

ModelBuilder.create()
    .from()
    .via(new WorkerNode(undefined,
    {
        worker: './worker.js',
        poolSize: 4,
        type: 'module'
    }))
    .to(new CallbackSinkNode(frame => {
        console.log("sink", frame);
    }))
    .build().then(model => {
        console.log("Model created ...");
        model.push(new DataFrame());
    }).catch(console.error);

const building = new Building("Pleinlaan 9");
const camera = new CameraObject("test");
console.log(building);
console.log(camera);

console.log(DataSerializer.serialize(new ReferenceSpace()));
console.log(DataSerializer.serialize(building));
console.log(DataSerializer.serialize(camera));
