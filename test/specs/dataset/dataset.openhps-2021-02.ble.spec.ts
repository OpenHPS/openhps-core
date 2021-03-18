import { 
    Absolute2DPosition, 
    AngleUnit, 
    CallbackSinkNode, 
    DataFrame, 
    DataObject, 
    GraphBuilder, 
    Model, 
    ModelBuilder, 
    Orientation, 
    RelativeRSSI, 
    RFTransmitterObject,
    MultilaterationNode,
    RelativeRSSIProcessing,
    PropagationModel
} from '../../../src';
import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';
import { expect } from "chai";
import { EvaluationDataFrame } from "../../mock/data/EvaluationDataFrame";

describe('dataset ipin2021', () => {
    describe('ble fingerprinting dataset', () => {
        let model: Model;
        let testSink: CallbackSinkNode<any> = new CallbackSinkNode();
        let testDataMean: CSVDataSource<any>;

        before(function(done) {
            testDataMean = new CSVDataSource(
                "test/data/OpenHPS-2021-02/ble_fingerprints.csv", 
                (row: any) => {
                    const object = new DataObject("phone");
                    const position = new Absolute2DPosition(
                        parseFloat(row['X']),
                        parseFloat(row['Y'])
                    );
                    position.orientation = Orientation.fromEuler({
                        yaw: parseFloat(row['ORIENTATION']),
                        roll: 0,
                        pitch: 0,
                        unit: AngleUnit.DEGREE
                    });
                    for (const prop in row) {
                        if (prop.includes("BEACON_")) {
                            const rssi = parseInt(row[prop]);
                            if (!Number.isNaN(rssi)) {
                                object.addRelativePosition(new RelativeRSSI(prop, rssi));
                            }
                        }
                    }
                    const evaluationObject = new DataObject("phone");
                    evaluationObject.setPosition(position);
                    const frame = new EvaluationDataFrame(object);
                    frame.evaluationObjects.set('phone', evaluationObject);
                    return frame;
                },
                {
                    uid: "test-data-mean",
                    persistence: false
                }
            );

            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .from(new CSVDataSource("test/data/OpenHPS-2021-02/beacons.csv", (row: any) => {
                        const object = new RFTransmitterObject(row['name']);
                        object.displayName = row['name'];
                        object.calibratedRSSI = -68;
                        object.environmenFactor = 2.2;
                        const position = new Absolute2DPosition(
                            parseFloat(row['x']),
                            parseFloat(row['y'])
                        );
                        object.setPosition(position);
                        return new DataFrame(object);
                    }, {
                        uid: "beacons"
                    }))
                    .to(new CallbackSinkNode()))
                .addShape(GraphBuilder.create()
                    .from(testDataMean)
                    .via(new RelativeRSSIProcessing({
                        propagationModel: PropagationModel.LOG_DISTANCE
                    }))
                    .via(new MultilaterationNode({
                        maxIterations: 1000,
                        incrementStep: 1
                    }))
                    .to(testSink))
                .build().then(m => {
                    model = m;
                    return model.pull({
                        count: 11,
                    });
                }).then(() => {
                    done();
                }).catch(done);
        });
    
    
        describe('online stage trilateration', () => {

            it('should have an average accuracy of 8 meters', (done) => {
                let errors = []
                testSink.callback = (data: EvaluationDataFrame) => {
                    const calculatedLocation = data.source.position as Absolute2DPosition;
                    // Accurate control location
                    const expectedLocation = data.evaluationObjects.get('phone').position as Absolute2DPosition;
                    errors.push(expectedLocation.distanceTo(calculatedLocation));
                };
                
                // Perform a pull
                testSink.pull({
                    count: testDataMean.size,
                    sourceNode: "test-data-mean",
                }).then(() => {
                    // console.log(Math.max(...errors))
                    // console.log(Math.min(...errors))
                    // console.log(errors.reduce((a, b) => a + b) / errors.length)
                    expect(errors.reduce((a, b) => a + b) / errors.length).to.be.lessThan(8);
                    done();
                }).catch(done);
            }).timeout(15000);

        });

    });
    
});
