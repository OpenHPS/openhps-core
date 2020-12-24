import { ModelBuilder } from '../../../dist/web/openhps-core';

ModelBuilder.create()
    .from()
    .to()
    .build().then(model => {
        console.log(model);
    });