import { ObjectProcessingNode, DataFrame, DataObject, GraphOptions, Accelerometer } from '../../../src';

export class DummyObjectProcessing extends ObjectProcessingNode<DataFrame> {

    public processObject(dataObject: DataObject, dataFrame?: DataFrame | undefined, options?: GraphOptions | undefined): Promise<DataObject> {
        return new Promise((resolve) => {
            dataFrame?.getSensor(Accelerometer, "test");
            resolve(dataObject);
        });
    }

}
