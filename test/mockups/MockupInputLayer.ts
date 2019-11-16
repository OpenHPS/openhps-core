import { InputLayer } from "../../src/layer/InputLayer";
import { MockupDataFrame } from "./MockupDataFrame";
import { PullOptions } from "../../src/layer/PullOptions";

export class MockupInputLayer extends InputLayer<MockupDataFrame>{

    constructor() {
        super();
        setTimeout(this.mockupTimer,1000);
    }

    public getNextDataFrame() : MockupDataFrame {
        let data = new MockupDataFrame();
        return data;
    }

    public mockupTimer() {
        this.push(this.getNextDataFrame(), { process: true });
        setTimeout(this.mockupTimer, 1000);
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions) : Promise<MockupDataFrame> {
        return new Promise<MockupDataFrame>((resolve,reject) => {
            resolve(this.getNextDataFrame());
        });
    }

}