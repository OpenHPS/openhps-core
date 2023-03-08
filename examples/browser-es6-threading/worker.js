import { CallbackNode, ModelBuilder } from "../common/openhps-core.es.js";
import worker from '../common/worker.openhps-core.es.js';

worker.setShape(ModelBuilder.create()
    .from()
    .via(new CallbackNode(frame => {
        frame.test = "abc";
        console.log("worker", frame);
    }))
    .to());

