import { expect } from 'chai';
import 'mocha';
import { DataObject, IMUDataFrame, Magnetism, ModelBuilder, GraphBuilder, SourceNode, MagnetometerCalibrationNode, CallbackSinkNode, Model, NodeDataService, NodeData } from '../../../../src';
import { CSVDataSource } from '../../../mock/nodes/source/CSVDataSource';

describe('node', () => {
    describe('processing', () => {
        describe('calibration', () => {
            describe('magnetometer', () => {

                it('should calibrate', (done) => {
                    done();
                    const source = new CSVDataSource('test/data/imu/magnetometer_calibration.csv', (row: any) => {
                        const source = new DataObject('M1');
                        const frame = new IMUDataFrame(source);
                        frame.frequency = 1000. / 16;
                        frame.magnetism = new Magnetism(parseFloat(row['Bx']), parseFloat(row['By']), parseFloat(row['Bz']));
                        return frame as any;
                    }, {
                        separator: ";"
                    });

                    ModelBuilder.create()
                        .addShape(GraphBuilder.create()
                            .from(source as any as SourceNode<any>)
                            .via(new MagnetometerCalibrationNode({
                                count: 500,
                                uid: "magnetometer"
                            }))
                            .to(new CallbackSinkNode(frame => {
                                frame.source;
                            })))
                        .build().then((model: Model) => {
                            let promise = model.pull();
                            for (let i = 1 ; i < 1000 ; i++) {
                                promise = promise.then(() => model.pull());
                            }
                            promise.then(() => {
                                // Check calibration
                                const service = model.findDataService(NodeData) as NodeDataService<NodeData>;
                                service.findData("magnetometer", "M1").then(data => {
                                    expect(data.scaleX).to.not.be.NaN;
                                    expect(data.scaleY).to.not.be.NaN;
                                    expect(data.scaleZ).to.not.be.NaN;
                                }).catch(done);
                            });
                        });
                }).timeout(10000);
            });
       });
    });
});