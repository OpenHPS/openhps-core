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
    RelativeRotationProcessingNode,
    AngularVelocity,
    AngleUnit,
    AngularVelocityUnit,
} from '../../../../src';

describe('node', () => {
    describe('processing relative orientation', () => {
        let model: Model;
        let callbackSink: CallbackSinkNode<IMUDataFrame>;
        const time = 0;
        let timeService: TimeService;

        before((done) => {
            callbackSink = new CallbackSinkNode();
            timeService = new TimeService(() => time);
            ModelBuilder.create()
                .addService(timeService)
                .from(new CallbackSourceNode())
                .via(new RelativeRotationProcessingNode())
                .to(callbackSink)
                .build()
                .then((m) => {
                    model = m;
                    done();
                });
        });

        it('should convert angular velocity to relative rotation', (done) => {
            callbackSink.callback = (frame: IMUDataFrame) => {
                const linearVelocity = frame.source.getPosition().linearVelocity;
                done();
            };

            const frame = new IMUDataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(0, 0));
            frame.frequency = 1000;
            frame.acceleration = new Acceleration(1, 0, 0);
            frame.angularVelocity = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
            frame.source = object;

            Promise.resolve(model.push(frame));
        });
    });
});
