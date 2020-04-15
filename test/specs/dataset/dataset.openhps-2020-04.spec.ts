// import { expect } from 'chai';
// import 'mocha';
// import { ModelBuilder, Model, DataFrame, DataObject, RelativeDistanceLocation, MetricLengthUnit, StorageSinkNode, CallbackSinkNode, SourceMergeNode, TimeUnit, WorkerNode, TrilaterationNode, Cartesian3DLocation } from '../../../src';
// import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';
// import { EvaluationDataFrame } from '../../mock/data/EvaluationDataFrame';

// function rssiToDistance(rssi: number) {
//     return Math.pow(10, (-70 - rssi) / (10 * 2.8));
// }

// describe('dataset', () => {
//     describe('openhps-2020-04', () => {
//         let calibrationModel: Model<DataFrame, DataFrame>;
//         let trackingModel: Model<DataFrame, DataFrame>;

//         let scanSourceNode: CSVDataSource<any>;
//         let callbackNode: CallbackSinkNode<DataFrame>;

//         /**
//          * Initialize the data set and model
//          */
//         before((done) => {
//             // Calibration model to set-up or train the model
//             ModelBuilder.create()
//                 .from(new CSVDataSource("test/data/OpenHPS-2020-04/beacons.csv", (row: any) => {
//                     const dataFrame = new DataFrame();
//                     const beacon = new DataObject(row.BEACON);
//                     beacon.currentLocation = new Cartesian3DLocation(parseFloat(row.X), parseFloat(row.Y), parseFloat(row.Z));
//                     (beacon.currentLocation as Cartesian3DLocation).unit = MetricLengthUnit.CENTIMETER;
//                     dataFrame.addObject(beacon);
//                     return dataFrame;
//                 }))
//                 .to(new StorageSinkNode())
//                 .build().then(model => {
//                     calibrationModel = model;
                    
//                     // Process the calibration
//                     Promise.all([
//                         calibrationModel.pull(),
//                         calibrationModel.pull(),
//                         calibrationModel.pull(),
//                         calibrationModel.pull(),
//                     ]).then(() => {
//                         callbackNode = new CallbackSinkNode<EvaluationDataFrame>();
//                         scanSourceNode = new CSVDataSource("test/data/OpenHPS-2020-04/merged_data.csv", (row: any) => {
//                             const dataFrame = new EvaluationDataFrame();
                        
//                             const trackedObject = new DataObject("tracked");
//                             // The tracked object has three relative locations
//                             trackedObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("BEACON_1"), rssiToDistance(parseFloat(row['BEACON_1'])), MetricLengthUnit.CENTIMETER));
//                             trackedObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("BEACON_2"), rssiToDistance(parseFloat(row['BEACON_2'])), MetricLengthUnit.CENTIMETER));
//                             trackedObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("BEACON_3"), rssiToDistance(parseFloat(row['BEACON_3'])), MetricLengthUnit.CENTIMETER));
//                             trackedObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("BEACON_4"), rssiToDistance(parseFloat(row['BEACON_4'])), MetricLengthUnit.CENTIMETER));
//                             dataFrame.addObject(trackedObject);

//                             // Control object
//                             const evaluationObject = new DataObject("tracked");
//                             evaluationObject.currentLocation = new Cartesian3DLocation(parseFloat(row['X']), parseFloat(row['Y']), parseFloat(row['Z']));
//                             (evaluationObject.currentLocation as Cartesian3DLocation).unit = MetricLengthUnit.CENTIMETER;
//                             dataFrame.evaluationObjects.set(evaluationObject.uid, evaluationObject);
//                             return dataFrame;
//                         });
//                         done();
//                     });
//                 });
//         });

//         describe('trilateration', () => {

//             before(function(done) {
//                 this.timeout(10000);
//                 ModelBuilder.create()
//                     // Use the data from the calibration model
//                     .addService(calibrationModel.findDataService(DataObject))
//                     .from(scanSourceNode)
//                     .via(new TrilaterationNode<EvaluationDataFrame>())
//                     .to(callbackNode)
//                     .build().then(model => {
//                         trackingModel = model;
//                         done();
//                     });
//             });

//             after(() => {
//                 trackingModel.emit('destroy');
//             });    
            
//             describe('raw', () => {

//                 beforeEach((done) => {
//                     scanSourceNode.reset().then(() => {
//                         done();
//                     }).catch(ex => {
//                         done(ex);
//                     });
//                 });

//                 it('should trilaterate a location based on three relative distances', (done) => {
//                     callbackNode.callback = (data: EvaluationDataFrame) => {
//                         data.getObjects().forEach(object => {
//                             if (object.uid === "tracked") {
//                                 let calculatedLocation: Cartesian3DLocation = object.predictedLocations[0] as Cartesian3DLocation;
//                                 // Accurate control location
//                                 const expectedLocation: Cartesian3DLocation = data.evaluationObjects.get(object.uid).currentLocation as Cartesian3DLocation;
                                
//                                 // Convert meters to cm
//                                 calculatedLocation.x = calculatedLocation.unit.convert(calculatedLocation.x, expectedLocation.unit);
//                                 calculatedLocation.y = calculatedLocation.unit.convert(calculatedLocation.y, expectedLocation.unit);
//                                 calculatedLocation.unit = expectedLocation.unit;
    
//                                 expect(calculatedLocation).to.not.be.undefined;
    
//                                 const error = calculatedLocation.distance(expectedLocation);
//                                 console.log(error);
//                                 // Accuracy of 15 cm
//                                 expect(Math.abs(calculatedLocation.x - expectedLocation.x)).to.be.lessThan(15);
//                                 expect(Math.abs(calculatedLocation.y - expectedLocation.y)).to.be.lessThan(15);
    
//                                 done();
//                             }
//                         });
//                     };
    
//                     // Perform a pull
//                     Promise.resolve(trackingModel.pull());
//                 });
    
//                 it('should perform multiple trilaterations', (done) => {
//                     callbackNode.callback = (data: EvaluationDataFrame) => {
//                         data.getObjects().forEach(object => {
//                             if (object.uid === "tracked") {
//                                 let calculatedLocation: Cartesian3DLocation = object.predictedLocations[0] as Cartesian3DLocation;
//                                 // Accurate control location
//                                 const expectedLocation: Cartesian3DLocation = data.evaluationObjects.get(object.uid).currentLocation as Cartesian3DLocation;
                                
//                                 // Convert meters to cm
//                                 calculatedLocation.x = calculatedLocation.unit.convert(calculatedLocation.x, expectedLocation.unit);
//                                 calculatedLocation.y = calculatedLocation.unit.convert(calculatedLocation.y, expectedLocation.unit);
//                                 calculatedLocation.unit = expectedLocation.unit;
    
                                
//                                 const error = calculatedLocation.distance(expectedLocation);
//                                 console.log(error);
                                
//                                 expect(calculatedLocation).to.not.be.undefined;
//                             }
//                         });
//                     };
    
//                     // Perform a pull
//                     const promises = new Array();
//                     const size = scanSourceNode.size;
//                     for (let i = 0 ; i < size ; i++) {
//                         promises.push(trackingModel.pull());
//                     }
//                     Promise.all(promises).then(_ => {
//                         done();
//                     });
//                 }).timeout(2000);
    
//             });

//         });

//     });
// });