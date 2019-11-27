import { ProcessingLayer, DataOptions } from '../../../src/layer';
import { DataFrame } from '../../../src/data';

export class TimeConsumingLayer extends ProcessingLayer<DataFrame, DataFrame> {

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public process(data: DataFrame, options: DataOptions): Promise<DataFrame> { 
        return new Promise<DataFrame>((resolve, reject) => {
            setTimeout(() => {
                resolve(data);
            }, 10);
        });
    }

}
