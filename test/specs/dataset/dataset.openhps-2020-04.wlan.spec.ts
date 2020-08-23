import { expect } from 'chai';
import 'mocha';
import { EvaluationDataFrame } from '../../mock/data/EvaluationDataFrame';
import {
    Fingerprint,
    KNNFingerprintingNode,
    FingerprintingNode,
    Model,
    DataFrame,
    CallbackSinkNode,
    DataObjectService,
    MemoryDataService,
    ModelBuilder,
    DataObject,
    Absolute3DPosition,
    RelativeRSSIPosition
} from '../../../src';
import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';

describe('dataset', () => {
    describe('openhps-2020-04 (wlan only)', function() {
        this.timeout(5000); 

        let calibrationModel: Model<DataFrame, DataFrame>;
        let trackingModel: Model<DataFrame, DataFrame>;

        let callbackNode: CallbackSinkNode<DataFrame>;
        
        /**
         * Initialize the data set and model
         */
        before(function (done) {
            this.timeout(5000); 

            const fingerprintService = new DataObjectService(new MemoryDataService(Fingerprint));

            // Calibration model to set-up or train the model
            ModelBuilder.create()
                .addService(fingerprintService)
                .from(new CSVDataSource("test/data/OpenHPS-2020-04/train_data.csv", (row: any) => {
                    const dataFrame = new DataFrame();
                    const phoneObject = new DataObject("phone");
                    phoneObject.position = new Absolute3DPosition(parseFloat(row['X']), parseFloat(row['Y']), parseFloat(row['Z']));
                    for (let prop in row) {
                        if (prop.indexOf('WAP_') !== -1) {
                            let value = parseFloat(row[prop]);
                            if (value !== 100) {
                                const object = new DataObject(prop);
                                dataFrame.addObject(object);
                                const relativeLocation = new RelativeRSSIPosition(object, value);
                                phoneObject.addRelativePosition(relativeLocation);
                            }
                        }
                    }
                    dataFrame.addObject(phoneObject);
                    return dataFrame;
                }))
                .via(new FingerprintingNode({
                    objectFilter: (object: DataObject) => object.uid === 'phone'
                }))
                .to(new CallbackSinkNode())
                .build().then(model => {
                    calibrationModel = model;
                    callbackNode = new CallbackSinkNode<EvaluationDataFrame>();

                    const pullPromises = new Array();
                    for (let i = 0 ; i < 60 ; i++) {
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

        describe('online stage weighted knn with k=5', () => {

            before((done) => {
                ModelBuilder.create()
                    .addService(calibrationModel.findDataService(Fingerprint))
                    .from(new CSVDataSource("test/data/OpenHPS-2020-04/test_data.csv", (row: any) => {
                        const dataFrame = new EvaluationDataFrame();
                        const phoneObject = new DataObject("phone");
                        for (let prop in row) {
                            if (prop.indexOf('WAP_') !== -1) {
                                let value = parseFloat(row[prop]);
                                if (value !== 100) {
                                    const object = new DataObject(prop);
                                    dataFrame.addObject(object);
                                    const relativeLocation = new RelativeRSSIPosition(object, value);
                                    phoneObject.addRelativePosition(relativeLocation);
                                }
                            }
                        }
                        const evaluationObject = new DataObject("phone");
                        evaluationObject.position = new Absolute3DPosition(parseFloat(row['X']), parseFloat(row['Y']), parseFloat(row['Z']));
                        dataFrame.evaluationObjects.set("phone", evaluationObject);
                        dataFrame.addObject(phoneObject);
                        return dataFrame;
                    }))
                    .via(new KNNFingerprintingNode({
                        k: 5,
                        weighted: true,
                        naive: true,
                        defaultValue: 100,
                        objectFilter: (object: DataObject) => object.uid === 'phone',
                    }))
                    .to(callbackNode)
                    .build().then(model => {
                        trackingModel = model;
                        done();
                    });
            });

            after(() => {
                trackingModel.emit('destroy');
            });

            it('should have an average error of less than 100 cm', (done) => {
                let totalError = 0;
                let totalValues = 0;
                callbackNode.callback = (data: EvaluationDataFrame) => {
                    let calculatedLocation: Absolute3DPosition = data.getObjectByUID("phone").position as Absolute3DPosition;
                    // Accurate control location
                    const expectedLocation: Absolute3DPosition = data.evaluationObjects.get("phone").position as Absolute3DPosition;

                    totalError += expectedLocation.distanceTo(calculatedLocation);
                    totalValues++;
                };
    
                // Perform a pull
                const promises = new Array();
                for (let i = 0 ; i < 120 ; i++) {
                   promises.push(trackingModel.pull());
                }
                Promise.all(promises).then(() => {
                    expect(totalError / totalValues).to.be.lessThan(100);
                    done();
                }).catch(done);
            }).timeout(50000);

        });
    });
});