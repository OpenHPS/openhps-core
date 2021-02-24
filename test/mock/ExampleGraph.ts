import { CallbackSourceNode, DataFrame, DataObject, GraphBuilder } from "../../src";

export default GraphBuilder.create()
    .from(new CallbackSourceNode(() => {
        const frame = new DataFrame();
        const object = new DataObject("mvdewync");
        frame.source = object;
        return frame;
    }))
    .to();
