import { expect } from 'chai';
import 'mocha';
import { 
    ModelBuilder, 
    Model, 
    DataFrame, 
    CallbackSinkNode, 
    TimeUnit, 
    Cartesian3DLocation,
    MemoryDataObjectService,
    Fingerprint,
    StorageSinkNode,
    KNNFingerprintingNode,
    DataObject,
    RelativeDistanceLocation,
    FingerprintingNode,
    DataObjectService,
    ObjectMergeNode,
} from '../../../src';
import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';
import { EvaluationDataFrame } from '../../mock/data/EvaluationDataFrame';
import * as path from 'path';

function rssiToDistance(rssi) {
    return Math.pow(10, (-28 - rssi) / (10 * 2.8));
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

            const rssSource = new CSVDataSource("test/data/richter2018/Training_rss.csv", (row: any) => {
                const dataFrame = new DataFrame();
                const phoneObject = new DataObject("phone");
                aps.forEach(ap => {
                    let rssi = parseFloat(row[ap]);
                    let distance = rssiToDistance(rssi);
                    const object = new DataObject(ap);
                    dataFrame.addObject(object);
                    phoneObject.addRelativeLocation(new RelativeDistanceLocation(object, distance));
                });
                dataFrame.addObject(phoneObject);
                return dataFrame;
            }, aps);

            const locationSource = new CSVDataSource("test/data/richter2018/Training_coordinates.csv", (row: any) => {
                const dataFrame = new DataFrame();
                const phoneObject = new DataObject("phone");
                phoneObject.currentLocation = new Cartesian3DLocation(parseFloat(row.x), parseFloat(row.y), parseFloat(row.z));
                dataFrame.addObject(phoneObject);
                return dataFrame;
            }, ["x", "y", "z"]);

            ModelBuilder.create()
                .addService(fingerprintService)
                .from(rssSource, locationSource)
                .via(new ObjectMergeNode(
                    (object: DataObject) => object.uid == "phone", 
                    (frame: DataFrame) => { return frame.source.uid; }, 500, TimeUnit.MILLI))
                .via(new FingerprintingNode(object => object.uid === "phone"))
                .to(new StorageSinkNode())
                .build().then(model => {
                    calibrationModel = model;
                    callbackNode = new CallbackSinkNode<EvaluationDataFrame>();

                    const pullPromises = new Array();
                    for (let i = 0 ; i < 446 ; i++) {
                        pullPromises.push(model.pull());
                    }

                    Promise.all(pullPromises).then(() => {
                        done();
                    });
                });
        });

        after(() => {
            calibrationModel.emit('destroy');
        });

        describe('calibration', () => {

            it('should contain fingerprints', (done) => {
                const fingerprintService = calibrationModel.findDataService(Fingerprint) as DataObjectService<Fingerprint>;
               
                const rssiVector = [100,100,-90,-85.5,100,100,100,100,100,-68.1,-70.5,-69.6,-70.25,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,-71.583,-71.75,-72.833,-71.333,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,-79.1,-80.4,-80,-80.333,-85,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,-88.143,100,-76.333,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,-92,-92,-89,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,-56.917,-59,-57.75,-57.917,100,100,100,100,100,100,100,100,100,100,100,100,100,-88,100,100,100,100,100,100,100,100,100,100,-76.333,100,100,100,100,100,100,100,100,100,-85.4,-86,100,100,100,-83.4,100,100,100,100,100,100,100,-87,100,100,100,-90,-83.667,-91,100,-93,100,100,100,100,100,100,100,100,100,100,100,-81,-78,-76,-72,100,100,100,100,100,100,100,100,-70,-70.167,-70.25,-70.917,-76.5,-75,-87,-83,-83,100,-79,-80,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,-82,-80.333,100,100,100,100,100,100,100,100,100,100,100,100,100];
                fingerprintService.findAll().then(fingerprints => {
                    fingerprints.forEach(fingerprint => {
                        const location = fingerprint.currentLocation as Cartesian3DLocation;
                        if (location.point[0] === 227.94 &&
                            location.point[1] === 142.04 &&
                            location.point[2] === 0) {
                            expect(rssiVector.length).to.equal(fingerprint.relativeLocations.length);
                            for (let i = 0 ; i < rssiVector.length ; i++) {
                                const rssi = rssiVector[i];
                                let distance = rssiToDistance(rssi);
                                const relativeLocation = fingerprint.relativeLocations[i];
                                expect(distance).to.equal(relativeLocation.referenceValue);
                            }
                            return done();
                        }
                    });
                });
            }).timeout(10000);

        });

        describe('online stage knn with k=5', () => {

            before((done) => {
                ModelBuilder.create()
                    .addService(calibrationModel.findDataService(Fingerprint))
                    .from(new CSVDataSource("test/data/richter2018/Test_rss.csv", (row: any) => {
                        const dataFrame = new EvaluationDataFrame();
                        const phoneObject = new DataObject("phone");
                        aps.forEach(ap => {
                            let rssi = parseFloat(row[ap]);
                            let distance = rssiToDistance(rssi);
                            const object = new DataObject(ap);
                            dataFrame.addObject(object);
                            phoneObject.addRelativeLocation(new RelativeDistanceLocation(object, distance));
                        });
                        dataFrame.evaluationObjects = null;
                        dataFrame.addObject(phoneObject);
                        return dataFrame;
                    }, aps), new CSVDataSource("test/data/richter2018/Test_coordinates.csv", (row: any) => {
                        const dataFrame = new EvaluationDataFrame();
                        
                        const phoneObject = new DataObject("phone");
                        dataFrame.addObject(phoneObject);

                        const evaluationObject = new DataObject("phone");
                        evaluationObject.currentLocation = new Cartesian3DLocation(parseFloat(row.x), parseFloat(row.y), parseFloat(row.z));
                        dataFrame.evaluationObjects.set("phone", evaluationObject);
                        return dataFrame;
                    }, ["x", "y", "z"]))
                    .via(new ObjectMergeNode<EvaluationDataFrame>(
                        (object: DataObject) => object.uid == "phone", 
                        (frame: EvaluationDataFrame) => frame.source.uid, 500, TimeUnit.MILLI))
                        .via(new KNNFingerprintingNode({
                            k: 5,
                            weighted: false,
                            naive: true
                        }, object => object.uid === "phone"))
                    .to(callbackNode)
                    .build().then(model => {
                        trackingModel = model;
                        done();
                    });
            });

            after(() => {
                trackingModel.emit('destroy');
            });

            it('should have an average error of less than 18 meters', (done) => {
                let totalError = 0;
                let totalValues = 0;
                callbackNode.callback = (data: EvaluationDataFrame) => {
                    let calculatedLocation: Cartesian3DLocation = data.getObjectByUID("phone").predictedLocations[0] as Cartesian3DLocation;
                    // Accurate control location
                    const expectedLocation: Cartesian3DLocation = data.evaluationObjects.get("phone").currentLocation as Cartesian3DLocation;
                    
                    totalError += expectedLocation.distance(calculatedLocation);
                    totalValues++;
                };
    
                // Perform a pull
                const promises = new Array();
                for (let i = 0 ; i < 100 ; i++) {
                   promises.push(trackingModel.pull());
                }
                Promise.all(promises).then(() => {
                    expect(totalError / totalValues).to.be.lessThan(18);
                    done();
                }).catch(ex => {
                    done(ex);
                });
            }).timeout(50000);

        });

        describe('online stage weighted knn with k=5', () => {

            before((done) => {
                ModelBuilder.create()
                    .addService(calibrationModel.findDataService(Fingerprint))
                    .from(new CSVDataSource("test/data/richter2018/Test_rss.csv", (row: any) => {
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
                    }, aps), new CSVDataSource("test/data/richter2018/Test_coordinates.csv", (row: any) => {
                        const dataFrame = new EvaluationDataFrame();
                        
                        const phoneObject = new DataObject("phone");
                        dataFrame.addObject(phoneObject);

                        const evaluationObject = new DataObject("phone");
                        evaluationObject.currentLocation = new Cartesian3DLocation(parseFloat(row.x), parseFloat(row.y), parseFloat(row.z));
                        dataFrame.evaluationObjects.set("phone", evaluationObject);
                        return dataFrame;
                    }, ["x", "y", "z"]))
                    .via(new ObjectMergeNode<EvaluationDataFrame>(
                        (object: DataObject) => object.uid == "phone", 
                        (frame: EvaluationDataFrame) => frame.source.uid, 500, TimeUnit.MILLI))
                    // .via(new WorkerNode((builder) => {
                    //     const { WKNNFingerprintingNode } = require(path.join(__dirname, '../../../src/nodes/processing/fingerprinting/WKNNFingerprintingNode'));
                    //     builder.via(new WKNNFingerprintingNode(5, object => object.uid === "phone"))
                    // }, { directory: __dirname, poolSize: 4 }))
                    .via(new KNNFingerprintingNode({
                        k: 5,
                        weighted: true,
                        naive: true
                    }, object => object.uid === "phone"))
                    .to(callbackNode)
                    .build().then(model => {
                        trackingModel = model;
                        done();
                    });
            });

            after(() => {
                trackingModel.emit('destroy');
            });

            it('should have an average error of less than 17 meters', (done) => {
                let totalError = 0;
                let totalValues = 0;
                callbackNode.callback = (data: EvaluationDataFrame) => {
                    let calculatedLocation: Cartesian3DLocation = data.getObjectByUID("phone").predictedLocations[0] as Cartesian3DLocation;
                    // Accurate control location
                    const expectedLocation: Cartesian3DLocation = data.evaluationObjects.get("phone").currentLocation as Cartesian3DLocation;
                    
                    totalError += expectedLocation.distance(calculatedLocation);
                    totalValues++;
                };
    
                // Perform a pull
                const promises = new Array();
                for (let i = 0 ; i < 100 ; i++) {
                   promises.push(trackingModel.pull());
                }
                Promise.all(promises).then(() => {
                    expect(totalError / totalValues).to.be.lessThan(17);
                    done();
                }).catch(ex => {
                    done(ex);
                });
            }).timeout(50000);

        });
    });
});