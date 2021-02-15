import { 
    CallbackSourceNode, 
    DataFrame, 
    DataObject, 
    Fingerprint, 
    MemoryDataService, 
    ModelBuilder,
    FingerprintService
} from "../../src";

export default ModelBuilder.create()
    .addService(new FingerprintService(new MemoryDataService(Fingerprint)))
    .from(new CallbackSourceNode(() => {
        const frame = new DataFrame();
        const object = new DataObject("mvdewync");
        frame.source = object;
        return frame;
    }))
    .to();
