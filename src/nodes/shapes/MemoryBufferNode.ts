import { DataFrame } from '../../data/DataFrame';
import { DataFrameService, MemoryDataService } from '../../service';
import { BufferNode, BufferOptions } from './BufferNode';

/**
 * @category Flow shape
 */
export class MemoryBufferNode<InOut extends DataFrame> extends BufferNode<InOut> {
    constructor(options?: BufferOptions) {
        super(options);
        this.service = new DataFrameService(
            new MemoryDataService(DataFrame, {
                serialize: (d) => d,
                deserialize: (d) => d,
            }),
        ) as DataFrameService<InOut>;
    }
}
