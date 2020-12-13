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
    Absolute2DPosition,
    RelativeDistancePosition,
} from '../../../src';
import { CSVDataSource } from '../../mock/nodes/source/CSVDataSource';

/**
 * @param rssi
 */
function rssiToDistance(rssi: number) {
    return Math.pow(10, (-28 - rssi) / (10 * 2.8));
}

describe('dataset', () => {
    describe('laoudias2013', function () {
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

            const fingerprintService = new DataObjectService(new MemoryDataService(Fingerprint));

            ModelBuilder.create()
                .addService(fingerprintService)
                .from(
                    new CSVDataSource('test/data/laoudias2013/Training data/indoor-radiomap-nexus.txt', (row: any) => {
                        const dataFrame = new DataFrame();
                        const phoneObject = new DataObject('phone');
                        phoneObject.position = new Absolute2DPosition(parseFloat(row['# X']), parseFloat(row[' Y']));
                        for (const prop in row) {
                            if (prop.indexOf(':') !== -1) {
                                let rssi = parseFloat(row[prop]);
                                if (isNaN(rssi)) {
                                    rssi = 100;
                                }
                                const distance = rssiToDistance(rssi);
                                const object = new DataObject(prop.substr(1));
                                dataFrame.addObject(object);
                                phoneObject.addRelativePosition(new RelativeDistancePosition(object, distance));
                            }
                        }
                        dataFrame.addObject(phoneObject);
                        return dataFrame;
                    }),
                )
                .via(
                    new FingerprintingNode({
                        objectFilter: (object: DataObject) => object.uid === 'phone',
                    }),
                )
                .to(new CallbackSinkNode())
                .build()
                .then((model: Model<any, any>) => {
                    calibrationModel = model;
                    callbackNode = new CallbackSinkNode<EvaluationDataFrame>();

                    const pullPromises = [];
                    for (let i = 0; i < 2100; i++) {
                        pullPromises.push(model.pull({}));
                    }

                    Promise.all(pullPromises).then(() => {
                        done();
                    });
                });
        });

        after(() => {
            calibrationModel.emit('destroy');
        });

        describe('online stage knn with k=5', () => {
            before((done) => {
                ModelBuilder.create()
                    .addService(calibrationModel.findDataService(Fingerprint))
                    .from(
                        new CSVDataSource('test/data/laoudias2013/Test data/indoor-test-nexus.txt', (row: any) => {
                            const dataFrame = new EvaluationDataFrame();
                            const phoneObject = new DataObject('phone');
                            for (const prop in row) {
                                if (prop.indexOf(':') !== -1) {
                                    const rssi = parseFloat(row[prop]);
                                    if (!isNaN(rssi)) {
                                        const distance = rssiToDistance(rssi);
                                        const object = new DataObject(prop.substr(2));
                                        dataFrame.addObject(object);
                                        phoneObject.addRelativePosition(new RelativeDistancePosition(object, distance));
                                    }
                                }
                            }
                            const evaluationObject = new DataObject('phone');
                            evaluationObject.position = new Absolute2DPosition(
                                parseFloat(row['# X']),
                                parseFloat(row['  Y']),
                            );
                            dataFrame.evaluationObjects.set('phone', evaluationObject);
                            dataFrame.addObject(phoneObject);
                            return dataFrame;
                        }),
                    )
                    .via(
                        new KNNFingerprintingNode({
                            k: 5,
                            weighted: false,
                            naive: true,
                            objectFilter: (object: DataObject) => object.uid === 'phone',
                            defaultValue: rssiToDistance(100),
                        }),
                    )
                    .to(callbackNode)
                    .build()
                    .then((model: Model<any, any>) => {
                        trackingModel = model;
                        done();
                    });
            });

            after(() => {
                trackingModel.emit('destroy');
            });

            it('should have an average error of less than 5 meters', (done) => {
                let totalError = 0;
                let totalValues = 0;
                callbackNode.callback = (data: EvaluationDataFrame) => {
                    const calculatedLocation: Absolute2DPosition = data.getObjectByUID('phone')
                        .position as Absolute2DPosition;
                    // Accurate control location
                    const expectedLocation: Absolute2DPosition = data.evaluationObjects.get('phone')
                        .position as Absolute2DPosition;

                    totalError += expectedLocation.distanceTo(calculatedLocation);
                    totalValues++;
                };

                // Perform a pull
                const promises = [];
                for (let i = 0; i < 500; i++) {
                    promises.push(trackingModel.pull());
                }
                Promise.all(promises)
                    .then(() => {
                        expect(totalError / totalValues).to.be.lessThan(5);
                        done();
                    })
                    .catch(done);
            }).timeout(50000);
        });

        describe('online stage weighted knn with k=5', () => {
            before((done) => {
                ModelBuilder.create()
                    .addService(calibrationModel.findDataService(Fingerprint))
                    .from(
                        new CSVDataSource('test/data/laoudias2013/Test data/indoor-test-nexus.txt', (row: any) => {
                            const dataFrame = new EvaluationDataFrame();
                            const phoneObject = new DataObject('phone');
                            for (const prop in row) {
                                if (prop.indexOf(':') !== -1) {
                                    const rssi = parseFloat(row[prop]);
                                    if (!isNaN(rssi)) {
                                        const distance = rssiToDistance(rssi);
                                        const object = new DataObject(prop.substr(2));
                                        dataFrame.addObject(object);
                                        phoneObject.addRelativePosition(new RelativeDistancePosition(object, distance));
                                    }
                                }
                            }
                            const evaluationObject = new DataObject('phone');
                            evaluationObject.position = new Absolute2DPosition(
                                parseFloat(row['# X']),
                                parseFloat(row['  Y']),
                            );
                            dataFrame.evaluationObjects.set('phone', evaluationObject);
                            dataFrame.addObject(phoneObject);
                            return dataFrame;
                        }),
                    )
                    .via(
                        new KNNFingerprintingNode({
                            k: 5,
                            weighted: true,
                            naive: true,
                            defaultValue: rssiToDistance(100),
                        }),
                    )
                    .to(callbackNode)
                    .build()
                    .then((model: Model<any, any>) => {
                        trackingModel = model;
                        done();
                    });
            });

            after(() => {
                trackingModel.emit('destroy');
            });

            it('should have an average error of less than 5 meters', (done) => {
                let totalError = 0;
                let totalValues = 0;
                callbackNode.callback = (data: EvaluationDataFrame) => {
                    const calculatedLocation: Absolute2DPosition = data.getObjectByUID('phone')
                        .position as Absolute2DPosition;
                    // Accurate control location
                    const expectedLocation: Absolute2DPosition = data.evaluationObjects.get('phone')
                        .position as Absolute2DPosition;

                    totalError += expectedLocation.distanceTo(calculatedLocation);
                    totalValues++;
                };

                // Perform a pull
                const promises = [];
                for (let i = 0; i < 500; i++) {
                    promises.push(trackingModel.pull());
                }
                Promise.all(promises)
                    .then(() => {
                        expect(totalError / totalValues).to.be.lessThan(5);
                        done();
                    })
                    .catch(done);
            }).timeout(50000);
        });

        describe('online stage weighted knn with k=5 and kd-tree', () => {
            before((done) => {
                ModelBuilder.create()
                    .addService(calibrationModel.findDataService(Fingerprint))
                    .from(
                        new CSVDataSource('test/data/laoudias2013/Test data/indoor-test-nexus.txt', (row: any) => {
                            const dataFrame = new EvaluationDataFrame();
                            const phoneObject = new DataObject('phone');
                            for (const prop in row) {
                                if (prop.indexOf(':') !== -1) {
                                    const rssi = parseFloat(row[prop]);
                                    if (!isNaN(rssi)) {
                                        const distance = rssiToDistance(rssi);
                                        const object = new DataObject(prop.substr(2));
                                        dataFrame.addObject(object);
                                        phoneObject.addRelativePosition(new RelativeDistancePosition(object, distance));
                                    }
                                }
                            }
                            const evaluationObject = new DataObject('phone');
                            evaluationObject.position = new Absolute2DPosition(
                                parseFloat(row['# X']),
                                parseFloat(row['  Y']),
                            );
                            dataFrame.evaluationObjects.set('phone', evaluationObject);
                            dataFrame.addObject(phoneObject);
                            return dataFrame;
                        }),
                    )
                    .via(
                        new KNNFingerprintingNode({
                            k: 5,
                            weighted: true,
                            naive: false,
                            defaultValue: rssiToDistance(100),
                        }),
                    )
                    .to(callbackNode)
                    .build()
                    .then((model: Model<any, any>) => {
                        trackingModel = model;
                        done();
                    });
            });

            after(() => {
                trackingModel.emit('destroy');
            });

            it('should have an average error of less than 5 meters', (done) => {
                let totalError = 0;
                let totalValues = 0;
                callbackNode.callback = (data: EvaluationDataFrame) => {
                    const calculatedLocation: Absolute2DPosition = data.getObjectByUID('phone')
                        .position as Absolute2DPosition;
                    // Accurate control location
                    const expectedLocation: Absolute2DPosition = data.evaluationObjects.get('phone')
                        .position as Absolute2DPosition;

                    totalError += expectedLocation.distanceTo(calculatedLocation);
                    totalValues++;
                };

                // Perform a pull
                const promises = [];
                for (let i = 0; i < 500; i++) {
                    promises.push(trackingModel.pull());
                }
                Promise.all(promises)
                    .then(() => {
                        expect(totalError / totalValues).to.be.lessThan(5);
                        done();
                    })
                    .catch(done);
            }).timeout(50000);
        });
    });
});
