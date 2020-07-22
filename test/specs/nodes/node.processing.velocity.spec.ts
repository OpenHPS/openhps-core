import { expect } from 'chai';
import 'mocha';
import { VelocityProcessingNode, DataFrame, DataObject, Absolute2DPosition, LinearVelocity, Model, ModelBuilder, CallbackSourceNode, StorageSinkNode, CallbackSinkNode, AngularVelocity, AngleUnit, AngularVelocityUnit } from '../../../src';
import { exp } from 'mathjs';

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
                const position = frame.source.getCurrentPosition();
                expect(Math.round(position.point[0])).to.equal(4);
                expect(Math.round(position.point[1])).to.equal(4);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setCurrentPosition(new Absolute2DPosition(3, 3));
            object.getCurrentPosition().velocity.linear = new LinearVelocity(2, 2);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

        it('should process angular velocity on the orientation', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getCurrentPosition();
                // Linear position has not changed
                expect(Math.round(position.point[0])).to.equal(3);
                expect(Math.round(position.point[1])).to.equal(3);
                // Orientation should changed
                expect(Math.round(position.orientation.toVector(AngleUnit.DEGREES)[0])).to.equal(45);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setCurrentPosition(new Absolute2DPosition(3, 3));
            object.getCurrentPosition().velocity.angular = new AngularVelocity(90, 0, 0, AngularVelocityUnit.DEGREES_PER_SECOND);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

        it('should process angular velocity on the linear movement', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getCurrentPosition();
                // Linear position is (3, 3) + the linear and angular movement
                expect(Math.round(position.point[0])).to.equal(5);
                expect(Math.round(position.point[1])).to.equal(1);
                // Orientation should changed
                expect(Math.round(position.orientation.toVector(AngleUnit.DEGREES)[0])).to.equal(45);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setCurrentPosition(new Absolute2DPosition(3, 3));
            object.getCurrentPosition().velocity.angular = new AngularVelocity(90, 0, 0, AngularVelocityUnit.DEGREES_PER_SECOND);
            object.getCurrentPosition().velocity.linear = new LinearVelocity(4, 4, 0);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

    });

});