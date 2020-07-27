import { expect } from 'chai';
import 'mocha';
import { VelocityProcessingNode, DataFrame, DataObject, Absolute2DPosition, LinearVelocity, Model, ModelBuilder, CallbackSourceNode, StorageSinkNode, CallbackSinkNode, AngularVelocity, AngleUnit, AngularVelocityUnit, Orientation, EulerRotation } from '../../../src';

describe('node', () => {
    describe('processing velocity', () => {
        let model: Model;
        let callbackSink: CallbackSinkNode<DataFrame>;

        before((done) => {
            callbackSink = new CallbackSinkNode();
            ModelBuilder.create()
                .from(new CallbackSourceNode())
                .via(new VelocityProcessingNode())
                .to(callbackSink)
                .build().then(m => {
                    model = m;
                    done();
                });
        });

        it('should process linear velocity', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition();
                expect(Math.round(position.toVector()[0])).to.equal(4);
                expect(Math.round(position.toVector()[1])).to.equal(4);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(3, 3));
            object.getPosition().velocity.linear = new LinearVelocity(2, 2);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

        it('should process linear velocity in a given direction (orientation)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition();
                expect(Math.round(position.toVector()[0] * 10.) / 10.).to.equal(3.5);
                expect(Math.round(position.toVector()[1] * 10.) / 10.).to.equal(3);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(3, 3));
            object.getPosition().velocity.linear = new LinearVelocity(2, 2);
            object.getPosition().orientation = Orientation.fromEulerRotation(new EulerRotation(90, 90, 0, 'XYZ', AngleUnit.DEGREES));
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

        it('should process angular velocity on the orientation', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition();
                // Linear position has not changed
                expect(Math.round(position.toVector()[0])).to.equal(3);
                expect(Math.round(position.toVector()[1])).to.equal(3);
                // Orientation should changed
                expect(Math.round(position.orientation.toEulerRotation().toVector(AngleUnit.DEGREES)[0])).to.equal(45);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(3, 3));
            object.getPosition().velocity.angular = new AngularVelocity(90, 0, 0, AngularVelocityUnit.DEGREES_PER_SECOND);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

        it('should process angular velocity on the linear movement', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition();
                // Linear position is (3, 3) + the linear and angular movement
                expect(Math.round(position.toVector()[0])).to.equal(4);
                expect(Math.round(position.toVector()[1])).to.equal(2);
                // Orientation should change
                expect(Math.round(position.orientation.toEulerRotation().toVector(AngleUnit.DEGREES)[0])).to.equal(45);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(3, 3));
            object.getPosition().velocity.angular = new AngularVelocity(90, 0, 0, AngularVelocityUnit.DEGREES_PER_SECOND);
            object.getPosition().velocity.linear = new LinearVelocity(4, 4, 0);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

    });

});