import { DataFrame } from '../../data/DataFrame';
import { SinkNodeOptions } from '../SinkNode';
import { CallbackSinkNode } from './CallbackSinkNode';

/**
 * This sink node will serialize the data frames pushed to this
 * output layer, and log them to the console using the logging function
 * specified in the constructor.
 * @category Sink node
 */
export class LoggingSinkNode<In extends DataFrame> extends CallbackSinkNode<In> {
    /**
     * Create a new logger output sink
     * @param {Function} loggingFn Logging function
     * @param {SinkNodeOptions} options Sink node options
     */
    constructor(loggingFn?: (frame: In | In[]) => void, options?: SinkNodeOptions) {
        super(loggingFn, options);
        if (loggingFn === undefined) {
            this.callback = (frame: In | In[]) => {
                this.logger('debug', `Received a data frame in node ${this.uid}`, frame);
            };
        }
    }
}
