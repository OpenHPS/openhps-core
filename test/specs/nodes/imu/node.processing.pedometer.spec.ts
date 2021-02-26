import { Absolute2DPosition, PedometerData, Acceleration, AngleUnit, CallbackSinkNode, DataFrame, IMUDataFrame, IMUSensorObject, Model, ModelBuilder, Orientation, PedometerProcessingNode } from "../../../../src";
import { CSVDataSource } from "../../../mock/nodes/source/CSVDataSource";
import { expect } from 'chai';

describe('node processing pedometer', () => {
    let model: Model;
    let source = new CSVDataSource("test/data/buegler2017/DataWalking1.csv", (row) => {
        const frame = new IMUDataFrame();
        const object = new IMUSensorObject("phone");
        object.position = new Absolute2DPosition(0, 0);
        frame.source = object;
        frame.linearAcceleration = new Acceleration(
            parseFloat(row['0']),
            parseFloat(row['1']),
            parseFloat(row['2'])
        );
        frame.absoluteOrientation = Orientation.fromEuler({
            x: parseFloat(row['4']),
            y: -parseFloat(row['5']),
            z: parseFloat(row['3']),
            unit: AngleUnit.RADIAN,
        });
        frame.frequency = 100;
        return frame;
    }, {
        headers: false
    });
    let sink = new CallbackSinkNode();
    let pedometer = new PedometerProcessingNode({
        stepSize: 1
    });

    before(function (done) {
        this.timeout(10000);
        ModelBuilder.create()
            .from(source)
            .via(pedometer)
            .to(sink)
            .build().then(m => {
                model = m;
                done();
            }).catch(done);
    });

    it('should count 116 steps without streaming', (done) => {
        source.emitAsync('build').then(() => {
            const pedometerData = new PedometerData();
            source.inputData.forEach(frame => {
                pedometerData.add(frame);
            });
            expect(pedometerData.accelerometerData.length).to.equal(6809);
            return pedometer.processPedometer(pedometerData);
        }).then(steps => {
            console.log(steps.length);
            done();
        });
    });

    it('should count 116 steps with streaming', (done) => {
        let steps = 0;
        sink.callback = (frame: DataFrame) => {
            steps += frame.source.position.linearVelocity.x;
        };
        model.pull({
            count: 6809
        }).then(() => {
            done();
        }).catch(done);
    });
    
});
