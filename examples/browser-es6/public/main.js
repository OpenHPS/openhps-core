import { ModelBuilder } from './openhps-core.es.js';
import { Building } from './openhps-geospatial.es.js';

ModelBuilder.create()
    .from()
    .to()
    .build().then(console.log)

console.log(new Building("Pleinlaan 9"));
