import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, Model, DataFrame, DataObject, RelativeDistanceLocation, MetricLengthUnit, Cartesian2DLocation, StorageSinkNode, CallbackSinkNode, SourceMergeNode, TimeUnit, WorkerNode, TrilaterationNode } from '../../../src';
import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';
import { EvaluationDataFrame } from '../../mock/data/EvaluationDataFrame';

describe('dataset', () => {
    describe('liwste2017', () => {
        let calibrationModel: Model<DataFrame, DataFrame>;
        let trackingModel: Model<DataFrame, DataFrame>;

        let scanSourceNode: CSVDataSource<any>;
        let callbackNode: CallbackSinkNode<DataFrame>;

        /**
         * Initialize the data set and model
         */
        before((done) => {
            // Calibration model to set-up or train the model
            ModelBuilder.create()
                .from(new CSVDataSource("test/data/liwste2017/beacons.csv", (row: any) => {
                    const dataFrame = new DataFrame();
                    const beacon = new DataObject(`beacon_${row.Beacon}`);
                    beacon.currentLocation = new Cartesian2DLocation(parseFloat(row.X), parseFloat(row.Y));
                    (beacon.currentLocation as Cartesian2DLocation).unit = MetricLengthUnit.METER;
                    dataFrame.addObject(beacon);
                    return dataFrame;
                }))
                .to(new StorageSinkNode())
                .build().then(model => {
                    calibrationModel = model;
                    
                    // Process the calibration
                    Promise.all([
                        calibrationModel.pull(),
                        calibrationModel.pull(),
                        calibrationModel.pull(),
                    ]).then(_ => {
                        callbackNode = new CallbackSinkNode<EvaluationDataFrame>();
                        scanSourceNode = new CSVDataSource("test/data/liwste2017/scans.csv", (row: any) => {
                            const dataFrame = new EvaluationDataFrame();
                        
                            const trackedObject = new DataObject("tracked");
                            // The tracked object has three relative locations
                            trackedObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("beacon_A"), parseFloat(row['Distance A']), MetricLengthUnit.METER));
                            trackedObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("beacon_B"), parseFloat(row['Distance B']), MetricLengthUnit.METER));
                            trackedObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("beacon_C"), parseFloat(row['Distance C']), MetricLengthUnit.METER));
                            dataFrame.addObject(trackedObject);

                            // Control object
                            const evaluationObject = new DataObject("tracked");
                            evaluationObject.currentLocation = new Cartesian2DLocation(parseFloat(row['Position X']), parseFloat(row['Position Y']));
                            (evaluationObject.currentLocation as Cartesian2DLocation).unit = MetricLengthUnit.CENTIMETER;
                            dataFrame.evaluationObjects.set(evaluationObject.uid, evaluationObject);

                            return dataFrame;
                        });
                        done();
                    });
                });
        });

        describe('trilateration', () => {

            before(function(done) {
                this.timeout(10000);
                ModelBuilder.create()
                    // Use the data from the calibration model
                    .addService(calibrationModel.findDataService(DataObject))
                    .from(scanSourceNode)
                    // .via(new WorkerNode((builder) => {
                    //     const { TrilaterationNode } = require(path.join(__dirname, '../../../src'));
                    //     const { EvaluationDataFrame } = require(path.join(__dirname, '../../mock/data/EvaluationDataFrame'));
                    //     builder.via(new TrilaterationNode())
                    // }, {
                    //     directory: __dirname
                    // }))
                    .via(new TrilaterationNode<EvaluationDataFrame>())
                    .to(callbackNode)
                    .build().then(model => {
                        trackingModel = model;
                        done();
                    });
            });

            after(() => {
                trackingModel.emit('destroy');
            });    

            describe('calibration', () => {

                it('should contain calibration data for beacon A', (done) => {
                    trackingModel.findDataService(DataObject).findByUID("beacon_A").then(beacon => {
                        expect(beacon).to.not.be.null;
                        expect(beacon.currentLocation).to.be.instanceOf(Cartesian2DLocation);
                        expect((beacon.currentLocation as Cartesian2DLocation).x).to.equal(0.10);
                        done();
                    });
                });
        
                it('should contain calibration data for beacon B', (done) => {
                    trackingModel.findDataService(DataObject).findByUID("beacon_B").then(beacon => {
                        expect(beacon).to.not.be.null;
                        expect(beacon.currentLocation).to.be.instanceOf(Cartesian2DLocation);
                        expect((beacon.currentLocation as Cartesian2DLocation).x).to.equal(2.74);
                        done();
                    });
                });
        
                it('should contain calibration data for beacon C', (done) => {
                    trackingModel.findDataService(DataObject).findByUID("beacon_C").then(beacon => {
                        expect(beacon).to.not.be.null;
                        expect(beacon.currentLocation).to.be.instanceOf(Cartesian2DLocation);
                        expect((beacon.currentLocation as Cartesian2DLocation).x).to.equal(1.22);
                        done();
                    });
                });

            });
            
            describe('raw', () => {

                beforeEach((done) => {
                    scanSourceNode.reset().then(_ => {
                        done();
                    }).catch(ex => {
                        done(ex);
                    });
                });

                it('should trilaterate a location based on three relative distances', (done) => {
                    callbackNode.callback = (data: EvaluationDataFrame) => {
                        data.getObjects().forEach(object => {
                            if (object.uid === "tracked") {
                                let calculatedLocation: Cartesian2DLocation = object.predictedLocations[0] as Cartesian2DLocation;
                                // Accurate control location
                                const expectedLocation: Cartesian2DLocation = data.evaluationObjects.get(object.uid).currentLocation as Cartesian2DLocation;
                                
                                // Convert meters to cm
                                calculatedLocation.x = calculatedLocation.unit.convert(calculatedLocation.x, expectedLocation.unit);
                                calculatedLocation.y = calculatedLocation.unit.convert(calculatedLocation.y, expectedLocation.unit);
                                calculatedLocation.unit = expectedLocation.unit;
    
                                expect(calculatedLocation).to.not.be.undefined;
    
                                // Accuracy of 15 cm
                                expect(Math.abs(calculatedLocation.x - expectedLocation.x)).to.be.lessThan(15);
                                expect(Math.abs(calculatedLocation.y - expectedLocation.y)).to.be.lessThan(15);
    
                                done();
                            }
                        });
                    };
    
                    // Perform a pull
                    Promise.resolve(trackingModel.pull());
                });
    
                it('should perform multiple trilaterations', (done) => {
                    callbackNode.callback = (data: EvaluationDataFrame) => {
                        data.getObjects().forEach(object => {
                            if (object.uid === "tracked") {
                                let calculatedLocation: Cartesian2DLocation = object.predictedLocations[0] as Cartesian2DLocation;
                                // Accurate control location
                                const expectedLocation: Cartesian2DLocation = data.evaluationObjects.get(object.uid).currentLocation as Cartesian2DLocation;
                                
                                // Convert meters to cm
                                calculatedLocation.x = calculatedLocation.unit.convert(calculatedLocation.x, expectedLocation.unit);
                                calculatedLocation.y = calculatedLocation.unit.convert(calculatedLocation.y, expectedLocation.unit);
                                calculatedLocation.unit = expectedLocation.unit;
    
                                expect(calculatedLocation).to.not.be.undefined;
                            }
                        });
                    };
    
                    // Perform a pull
                    const promises = new Array();
                    const size = scanSourceNode.size;
                    for (let i = 0 ; i < size ; i++) {
                        promises.push(trackingModel.pull());
                    }
                    Promise.all(promises).then(_ => {
                        done();
                    });
                }).timeout(2000);
    
            });

        });

    });
});