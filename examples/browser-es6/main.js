import { ModelBuilder, DataSerializer, ReferenceSpace } from '../common/openhps-core.es.js';
import { Building } from '../common/openhps-geospatial.es.js';
import { CameraObject } from '../common/openhps-video.es.js';

ModelBuilder.create()
    .from()
    .to()
    .build().then(console.log)

const building = new Building("Pleinlaan 9");
const camera = new CameraObject("test");
console.log(building);
console.log(camera);

console.log(DataSerializer.serialize(new ReferenceSpace()));
console.log(DataSerializer.serialize(building));
console.log(DataSerializer.serialize(camera));
