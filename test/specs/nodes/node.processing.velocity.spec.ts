import { expect } from 'chai';
import 'mocha';
import { VelocityProcessingNode, DataFrame, DataObject, Absolute2DPosition, LinearVelocity, Model, ModelBuilder, CallbackSourceNode, StorageSinkNode, CallbackSinkNode, AngularVelocity, AngleUnit, AngularVelocityUnit, Quaternion, Euler, Absolute3DPosition } from '../../../src';

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
                const position = frame.source.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x)).to.equal(4);
                expect(Math.round(position.y)).to.equal(4);
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

        it('should process linear velocity from the origin in a given direction', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x * 10.) / 10.).to.equal(-0.5);
                expect(Math.round(position.y * 10.) / 10.).to.equal(0.5);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(0, 0));
            object.getPosition().velocity.linear = new LinearVelocity(1, 1);
            object.getPosition().orientation = Quaternion.fromEuler({ yaw: 90, pitch: 0, roll: 0, unit: AngleUnit.DEGREES });
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });


        it('should process linear velocity from (3, 3) in a given direction', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x * 10.) / 10.).to.equal(2);
                expect(Math.round(position.y * 10.) / 10.).to.equal(4);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(3, 3));
            object.getPosition().velocity.linear = new LinearVelocity(2, 2);
            object.getPosition().orientation = Quaternion.fromEuler({ yaw: 90, pitch: 0, roll: 0, unit: AngleUnit.DEGREES });
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

        it('should process angular velocity on the orientation', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                // Linear position has not changed
                expect(Math.round(position.x)).to.equal(3);
                expect(Math.round(position.y)).to.equal(3);
                // Orientation should changed
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREES).z)).to.equal(45);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(3, 3));
            object.getPosition().velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREES_PER_SECOND);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 500);
        });

        it('should process angular velocity on the linear movement (z+)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10.).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10.).to.equal(0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREES).z)).to.equal(90);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(0, 0));
            object.getPosition().velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREES_PER_SECOND);
            object.getPosition().velocity.linear = new LinearVelocity(1, 0, 0);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 1000);
        });

        it('should process angular velocity on the linear movement (z-)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10.).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10.).to.equal(-0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREES).z)).to.equal(-90);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(0, 0));
            object.getPosition().velocity.angular = new AngularVelocity(0, 0, -90, AngularVelocityUnit.DEGREES_PER_SECOND);
            object.getPosition().velocity.linear = new LinearVelocity(1, 0, 0);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 1000);
        });

        it('should process angular velocity on the linear movement (y+)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute3DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10.).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10.).to.equal(0);
                expect(Math.round(position.z * 10) / 10.).to.equal(0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREES).y)).to.equal(90);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute3DPosition(0, 0, 0));
            object.getPosition().velocity.angular = new AngularVelocity(0, 90, 0, AngularVelocityUnit.DEGREES_PER_SECOND);
            object.getPosition().velocity.linear = new LinearVelocity(1, 0, 0);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 1000);
        });

        it('should process angular velocity on the linear movement (y-)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute3DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10.).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10.).to.equal(0);
                expect(Math.round(position.z * 10) / 10.).to.equal(-0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREES).y)).to.equal(-90);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setPosition(new Absolute3DPosition(0, 0, 0));
            object.getPosition().velocity.angular = new AngularVelocity(0, -90, 0, AngularVelocityUnit.DEGREES_PER_SECOND);
            object.getPosition().velocity.linear = new LinearVelocity(1, 0, 0);
            frame.source = object;

            setTimeout(() => {
                Promise.resolve(model.push(frame));
            }, 1000);
        });

    });

});