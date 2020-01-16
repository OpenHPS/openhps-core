import { DataFrame } from "../../data/DataFrame";
import { SinkNode } from "../SinkNode";
import { GraphPushOptions } from "../../graph/GraphPushOptions";

/**
 * This sink node will serialize the data frames pushed to this
 * output layer, and log them to the console using the logging function
 * specified in the constructor.
 */
export class LoggingSinkNode<In extends DataFrame> extends SinkNode<In> {
    private _loggingFn: (data: In) => void;

    /**
     * Create a new logger output sink
     * @param loggingFn Logging function
     */
    constructor(loggingFn: (data: In) => void = function(data: In) { }) {
        super();
        this._loggingFn = loggingFn;
    }
    
    public onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._loggingFn(data);
            resolve();
        });
    }
    
} 
