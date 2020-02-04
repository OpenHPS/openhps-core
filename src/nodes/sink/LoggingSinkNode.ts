import { DataFrame } from "../../data/DataFrame";
import { SinkNode } from "../SinkNode";
import { GraphPushOptions } from "../../graph/GraphPushOptions";
import { CallbackSinkNode } from "./CallbackSinkNode";

/**
 * This sink node will serialize the data frames pushed to this
 * output layer, and log them to the console using the logging function
 * specified in the constructor.
 */
export class LoggingSinkNode<In extends DataFrame> extends CallbackSinkNode<In> {
    /**
     * Create a new logger output sink
     * @param loggingFn Logging function
     */
    constructor(loggingFn?: (data: In, options?: GraphPushOptions) => void) {
        super();
        if (loggingFn === undefined) {
            loggingFn = (data: In, options?: GraphPushOptions) => {
                this.logger("info", data);
            };
        }

        this.callback = loggingFn;
    }
    
    public onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.callback(data, options);
            resolve();
        });
    }
    
} 
