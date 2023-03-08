import { CallbackNode, ModelBuilder } from "../common/openhps-core.es.js";

export default ModelBuilder.create()
    .from()
    .via(new CallbackNode(frame => {
        frame.test = "abc";
        console.log("worker", frame);
    }))
    .to();
