import { expect } from 'chai';
import 'mocha';
import {
    CallbackSinkNode,
    Model,
    DataFrame,
    ModelBuilder,
    CallbackSourceNode,
    AccelerationProcessingNode,
    Acceleration,
    TimeService,
    Absolute2DPosition,
    DataObject,
    IMUDataFrame,
    AngularVelocity,
    CallbackNode,
    RelativeRotationProcessingNode,
    AccelerationUnit,
    AngleUnit,
    AngularVelocityUnit,
    GravityProcessingNode,
} from '../../../src';

describe('example', () => {
    describe('imu', () => {
        it('should filter out gravity from a stationary object', (done) => {
            const object = new DataObject();
            const position = new Absolute2DPosition(0, 0);
            object.setPosition(position);

            ModelBuilder.create()
                .from(new CallbackSourceNode(() => {
                    const frame = new IMUDataFrame(object);
                    frame.frequency = 50;
                    frame.acceleration = new Acceleration(
                        -0.04360794275999069, 
                        -0.016298960894346237, 
                        1.0199016332626343,
                        AccelerationUnit.GRAVITATIONAL_FORCE);
                    frame.angularVelocity = new AngularVelocity(
                        -0.0010652969463144809, 
                        0, 
                        -0.0021305938926289617);
                    return frame;
                }))
                .via(new RelativeRotationProcessingNode())
                .via(new GravityProcessingNode())
                .to(new CallbackSinkNode(frame => {
                    expect(Math.round(frame.gravity.z)).to.equal(10);
                    done();
                }))
                .build().then(model => {
                    return model.pull();
                });
        });

        it('should filter out gravity from a moving object', (done) => {
            const object = new DataObject();
            const position = new Absolute2DPosition(0, 0);
            object.setPosition(position);

            ModelBuilder.create()
                .from(new CallbackSourceNode(() => {
                    const frame = new IMUDataFrame(object);
                    frame.frequency = 50;
                    frame.acceleration = new Acceleration(
                        0.16284647583961487,
                        0.18739065527915955,
                        0.730134129524231,
                        AccelerationUnit.GRAVITATIONAL_FORCE);
                    frame.angularVelocity = new AngularVelocity(
                        5.4010555178144175,
                        1.1334759508786076,
                        -0.5773909449024486);
                    return frame;
                }))
                .via(new RelativeRotationProcessingNode())
                .via(new GravityProcessingNode())
                .to(new CallbackSinkNode(frame => {
                    done();
                }))
                .build().then(model => {
                    return model.pull();
                });
        });
    });
});
