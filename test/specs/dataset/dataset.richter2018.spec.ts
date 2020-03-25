import { expect } from 'chai';
import 'mocha';
import { 
    ModelBuilder, 
    Model, 
    DataFrame, 
    CallbackSinkNode, 
    SourceMergeNode, 
    TimeUnit, 
    Cartesian3DLocation,
    MemoryDataObjectService,
    Fingerprint,
    StorageSinkNode,
    KNNFingerprintingNode,
    DataObject,
    RelativeDistanceLocation,
    FingerprintingNode
} from '../../../src';
import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';
import { EvaluationDataFrame } from '../../mock/data/EvaluationDataFrame';

function rssiToDistance(rssi) {
    return Math.pow(10, (-60 - rssi) / (10 - 1.2));
}

describe('dataset', () => {
    describe('richter2018', function() {
        this.timeout(5000); 

        let calibrationModel: Model<DataFrame, DataFrame>;
        let trackingModel: Model<DataFrame, DataFrame>;

        let callbackNode: CallbackSinkNode<DataFrame>;

        let aps = new Array();
        
        /**
         * Initialize the data set and model
         */
        before(function (done) {
            this.timeout(5000); 

            // Calibration model to set-up or train the model
            for (let i = 0 ; i < 489 ; i++) aps.push(`AP${i + 1}`);

            const fingerprintService = new MemoryDataObjectService(Fingerprint);

            new ModelBuilder()
                .addService(fingerprintService)
                .from(new CSVDataSource("test/data/richter2018/Training_rss.csv", (row: any) => {
                    const dataFrame = new DataFrame();
                    const phoneObject = new DataObject("phone");
                    aps.forEach(ap => {
                        const object = new DataObject(ap);
                        dataFrame.addObject(object);
                        phoneObject.addRelativeLocation(new RelativeDistanceLocation(object, rssiToDistance(parseFloat(row[ap]))));
                    });
                    dataFrame.addObject(phoneObject);
                    return dataFrame;
                }, aps), new CSVDataSource("test/data/richter2018/Training_coordinates.csv", (row: any) => {
                    const dataFrame = new DataFrame();
                    const phoneObject = new DataObject("phone");
                    phoneObject.currentLocation = new Cartesian3DLocation(parseFloat(row.x), parseFloat(row.y), parseFloat(row.z));
                    dataFrame.addObject(phoneObject);
                    return dataFrame;
                }, ["x", "y", "z"]))
                .via(new SourceMergeNode(100, TimeUnit.MILLI))
                .via(new FingerprintingNode())
                .to(new StorageSinkNode())
                .build().then(model => {
                    calibrationModel = model;
                    callbackNode = new CallbackSinkNode<EvaluationDataFrame>();

                    const pullPromises = new Array();
                    for (let i = 0 ; i < 100 ; i++) {
                        pullPromises.push(model.pull());
                    }

                    Promise.all(pullPromises).then(() => {
                        done();
                    });
                });
        });

        after(() => {
            calibrationModel.emit('destroy');
            trackingModel.emit('destroy');
        });

        describe('online stage', () => {

            before((done) => {
                new ModelBuilder()
                .addService(calibrationModel.findDataService(Fingerprint))
                .from(new CSVDataSource("test/data/richter2018/Training_rss.csv", (row: any) => {
                    const dataFrame = new EvaluationDataFrame();
                    const phoneObject = new DataObject("phone");
                    aps.forEach(ap => {
                        const object = new DataObject(ap);
                        dataFrame.addObject(object);
                        phoneObject.addRelativeLocation(new RelativeDistanceLocation(object, rssiToDistance(parseFloat(row[ap]))));
                    });
                    dataFrame.evaluationObjects = null;
                    dataFrame.addObject(phoneObject);
                    return dataFrame;
                }, aps), new CSVDataSource("test/data/richter2018/Training_coordinates.csv", (row: any) => {
                    const dataFrame = new EvaluationDataFrame();

                    const evaluationObject = new DataObject("phone");
                    evaluationObject.currentLocation = new Cartesian3DLocation(parseFloat(row.x), parseFloat(row.y), parseFloat(row.z));
                    dataFrame.evaluationObjects.set("phone", evaluationObject);
                    return dataFrame;
                }, ["x", "y", "z"]))
                .via(new SourceMergeNode(100, TimeUnit.MILLI))
                .via(new KNNFingerprintingNode(5))
                .to(callbackNode)
                .build().then(model => {
                    trackingModel = model;

                    done();
                });
            });


            it('should convert', (done) => {
                callbackNode.callback = (data: EvaluationDataFrame) => {
                    let calculatedLocation: Cartesian3DLocation = data.getObjectByUID("phone").predictedLocations[0] as Cartesian3DLocation;
                    // Accurate control location
                    const expectedLocation: Cartesian3DLocation = data.evaluationObjects.get("phone").currentLocation as Cartesian3DLocation;
                    
                    // console.log(calculatedLocation);
                    // console.log(expectedLocation);

                    expect(calculatedLocation.z).to.equal(expectedLocation.z);
                };
    
                // Perform a pull
                const promises = new Array();
                for (let i = 0 ; i < 1 ; i++) {
                    promises.push(trackingModel.pull());
                }
                Promise.all(promises).then(_ => {
                    done();
                }).catch(ex => {
                    done(ex);
                });
            });

        });
    });
});