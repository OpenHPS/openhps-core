import { expect } from 'chai';
import 'mocha';
import {
    Model,
    DataFrame,
    CallbackSinkNode,
    ModelBuilder,
    DataObject,
    Absolute3DPosition,
    RelativeRSSI,
    RFTransmitterObject,
    RelativeRSSIProcessing,
    PropagationModel,
} from '../../../src';
import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';
import { EvaluationDataFrame } from '../../mock/data/EvaluationDataFrame';
import { MultilaterationNode } from '../../../src';

describe('dataset openhps-2020-04 (ble only)', function () {
    this.timeout(5000);

    let calibrationModel: Model<DataFrame, DataFrame>;
    let trackingModel: Model<DataFrame, DataFrame>;

    let callbackNode: CallbackSinkNode<DataFrame>;

    /**
     * Initialize the data set and model
     */
    before(function (done) {
        this.timeout(5000);

        // Calibration model to set-up or train the model
        ModelBuilder.create()
            .from(
                new CSVDataSource('test/data/OpenHPS-2020-04/beacons.csv', (row: any) => {
                    const dataFrame = new DataFrame();
                    const object = new RFTransmitterObject(row['BEACON']);
                    object.calibratedRSSI = -68;
                    object.environmenFactor = 2.2;
                    object.setPosition(new Absolute3DPosition(parseInt(row['X']), parseInt(row['Y']), parseInt(row['Z'])))
                    dataFrame.addObject(object);
                    return dataFrame;
                }, { uid: "beacons" })
            )
            .to(new CallbackSinkNode())
            .build()
            .then((model) => {
                calibrationModel = model;
                callbackNode = new CallbackSinkNode<EvaluationDataFrame>();

                model.pull({
                    count: 4,
                    sourceNode: "beacons",
                }).then(() => {
                    done();
                });
            });
    });

    after(() => {
        calibrationModel.emit('destroy');
    });

    describe('online stage trilateration', () => {
        before((done) => {
            ModelBuilder.create()
                .addService(calibrationModel.findDataService(DataObject))
                .from(
                    new CSVDataSource('test/data/OpenHPS-2020-04/test_data.csv', (row: any) => {
                        const dataFrame = new EvaluationDataFrame();
                        const phoneObject = new DataObject('phone');
                        for (const prop in row) {
                            if (prop.indexOf('BEACON_') !== -1) {
                                const value = parseFloat(row[prop]);
                                if (value !== 100) {
                                    phoneObject.addRelativePosition(new RelativeRSSI(prop, value));
                                }
                            }
                        }
                        const evaluationObject = new DataObject('phone');
                        evaluationObject.position = new Absolute3DPosition(
                            parseFloat(row['X']),
                            parseFloat(row['Y']),
                            parseFloat(row['Z']),
                        );
                        dataFrame.evaluationObjects.set('phone', evaluationObject);
                        dataFrame.source = phoneObject;
                        return dataFrame;
                    }),
                )
                .via(new RelativeRSSIProcessing(RelativeRSSI, {
                    propagationModel: PropagationModel.LOG_DISTANCE
                }))
                .via(
                    new MultilaterationNode({
                        incrementStep: 0.1,
                        maxIterations: 1000
                    })
                )
                .to(callbackNode)
                .build()
                .then((model) => {
                    trackingModel = model;
                    done();
                });
        });

        after(() => {
            trackingModel.emit('destroy');
        });

        it('should have an average error of less than 161 cm', (done) => {
            let totalError = 0;
            let totalValues = 0;
            callbackNode.callback = (data: EvaluationDataFrame) => {
                const calculatedLocation: Absolute3DPosition = data.source
                    .position as Absolute3DPosition;
                // Accurate control location
                const expectedLocation: Absolute3DPosition = data.evaluationObjects.get('phone')
                    .position as Absolute3DPosition;
                totalError += expectedLocation.distanceTo(calculatedLocation);
                totalValues++;
            };

            // Perform a pull
            trackingModel.pull({
                count: 120,
            }).then(() => {
                expect(totalError / totalValues).to.be.lessThan(161);
                done();
            })
            .catch((ex) => {
                done(ex);
            });
        }).timeout(50000);
    });
    
});
