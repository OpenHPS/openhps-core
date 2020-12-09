import { expect } from 'chai';
import 'mocha';
import {
    VelocityProcessingNode,
    DataFrame,
    DataObject,
    Absolute2DPosition,
    LinearVelocity,
    Model,
    ModelBuilder,
    CallbackSourceNode,
    CallbackSinkNode,
    AngularVelocity,
    AngleUnit,
    AngularVelocityUnit,
    Quaternion,
    Absolute3DPosition,
    TimeService,
    TimeUnit,
    VelocityCalculationNode,
} from '../../../../src';

describe('node', () => {
    describe('calculating velocity', () => {
        let model: Model;
        let callbackSink: CallbackSinkNode<DataFrame>;
        let currentTime = 0;

        before((done) => {
            callbackSink = new CallbackSinkNode();
            ModelBuilder.create()
                .addService(new TimeService(() => currentTime, TimeUnit.MILLISECOND))
                .from(new CallbackSourceNode())
                .via(new VelocityProcessingNode())
                .via(new VelocityCalculationNode())
                .to(callbackSink)
                .build()
                .then((m) => {
                    model = m;
                    done();
                });
        });

        it('should calculate linear velocity when not provided', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
            };

            currentTime = 0;
            const startPosition = new Absolute2DPosition(0, 0);
            startPosition.timestamp = currentTime;

            const frame = new DataFrame();
            const object = new DataObject('robot');
            object.setPosition(startPosition);
            frame.source = object;

            model.push(frame).then(() => {
                currentTime += 500;
                const object = new DataObject('robot');
                const nextPosition = new Absolute2DPosition(1, 1);
                nextPosition.timestamp = currentTime;
                object.setPosition(nextPosition);
                callbackSink.callback = (frame: DataFrame) => {
                    const position = frame.source.getPosition();
                    expect(position.toVector3().x).to.equal(1);
                    expect(position.linearVelocity.x).to.equal(2);
                };
                model.push(new DataFrame(object)).then(() => {
                    currentTime += 500;
                    callbackSink.callback = (frame: DataFrame) => {
                        const position = frame.source.getPosition();
                        expect(position.toVector3().x).to.equal(2);
                        expect(position.linearVelocity.x).to.equal(2);
                    };
                    return model.push(new DataFrame(object.clone()));
                }).then(() => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
            });
        });

    });

    describe('processing velocity', () => {
        let model: Model;
        let callbackSink: CallbackSinkNode<DataFrame>;
        let currentTime = 0;

        before((done) => {
            callbackSink = new CallbackSinkNode();
            ModelBuilder.create()
                .addService(new TimeService(() => currentTime, TimeUnit.MILLISECOND))
                .from(new CallbackSourceNode())
                .via(new VelocityProcessingNode())
                .to(callbackSink)
                .build()
                .then((m) => {
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

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute2DPosition(3, 3);
            position.linearVelocity = new LinearVelocity(2, 2);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 500;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process linear velocity from the origin in a given direction', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x * 10) / 10).to.equal(-0.5);
                expect(Math.round(position.y * 10) / 10).to.equal(0.5);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute2DPosition(0, 0);
            position.linearVelocity = new LinearVelocity(1, 1);
            position.orientation = Quaternion.fromEuler({ yaw: 90, pitch: 0, roll: 0, unit: AngleUnit.DEGREE });
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 500;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process linear velocity from (3, 3) in a given direction', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x * 10) / 10).to.equal(2);
                expect(Math.round(position.y * 10) / 10).to.equal(4);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute2DPosition(3, 3);
            position.linearVelocity = new LinearVelocity(2, 2);
            position.orientation = Quaternion.fromEuler({ yaw: 90, pitch: 0, roll: 0, unit: AngleUnit.DEGREE });
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 500;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process angular velocity on the orientation', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                // Linear position has not changed
                expect(Math.round(position.x)).to.equal(3);
                expect(Math.round(position.y)).to.equal(3);
                // Orientation should changed
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREE).z)).to.equal(45);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute2DPosition(3, 3);
            position.angularVelocity = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 500;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process angular velocity on the linear movement (z+)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10).to.equal(0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREE).z)).to.equal(90);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute2DPosition(0, 0);
            position.velocity.linear = new LinearVelocity(1, 0, 0);
            position.velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 1000;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process angular velocity on the linear movement (z-)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10).to.equal(-0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREE).z)).to.equal(-90);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute2DPosition(0, 0);
            position.velocity.linear = new LinearVelocity(1, 0, 0);
            position.velocity.angular = new AngularVelocity(0, 0, -90, AngularVelocityUnit.DEGREE_PER_SECOND);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 1000;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process angular velocity on the linear movement (y+)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute3DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10).to.equal(0);
                expect(Math.round(position.z * 10) / 10).to.equal(-0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREE).y)).to.equal(90);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute3DPosition(0, 0, 0);
            position.velocity.linear = new LinearVelocity(1, 0, 0);
            position.velocity.angular = new AngularVelocity(0, 90, 0, AngularVelocityUnit.DEGREE_PER_SECOND);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 1000;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process angular velocity on the linear movement (y-)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute3DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10).to.equal(0.6); // Should be less than 1
                expect(Math.round(position.y * 10) / 10).to.equal(0);
                expect(Math.round(position.z * 10) / 10).to.equal(0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREE).y)).to.equal(-90);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute3DPosition(0, 0, 0);
            position.velocity.linear = new LinearVelocity(1, 0, 0);
            position.velocity.angular = new AngularVelocity(0, -90, 0, AngularVelocityUnit.DEGREE_PER_SECOND);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 1000;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process angular velocity on the linear movement (x+)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute3DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10).to.equal(0);
                expect(Math.round(position.y * 10) / 10).to.equal(0.6);
                expect(Math.round(position.z * 10) / 10).to.equal(0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREE).x)).to.equal(90);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute3DPosition(0, 0, 0);
            position.velocity.linear = new LinearVelocity(0, 1, 0);
            position.velocity.angular = new AngularVelocity(90, 0, 0, AngularVelocityUnit.DEGREE_PER_SECOND);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 1000;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should process angular velocity on the linear movement (x-)', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute3DPosition;
                // Linear position is (0, 0) + the linear and angular movement
                expect(Math.round(position.x * 10) / 10).to.equal(0);
                expect(Math.round(position.y * 10) / 10).to.equal(0.6);
                expect(Math.round(position.z * 10) / 10).to.equal(-0.6);
                // Orientation should change
                expect(Math.round(position.orientation.toEuler().toVector(AngleUnit.DEGREE).x)).to.equal(-90);
                done();
            };

            currentTime = 0;
            const object = new DataObject();
            const position = new Absolute3DPosition(0, 0, 0);
            position.velocity.linear = new LinearVelocity(0, 1, 0);
            position.velocity.angular = new AngularVelocity(-90, 0, 0, AngularVelocityUnit.DEGREE_PER_SECOND);
            position.timestamp = currentTime;
            object.setPosition(position);
            currentTime += 1000;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should not speed up when turning (no intermediate calculations)', (done) => {
            // Meaning it should not speed up, the travelled distance should not
            // be higher than a direct path

            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                const distance = position.distanceTo(startPosition);
                expect(distance).to.be.below(1);
                done();
            };

            currentTime = 0;

            const startPosition = new Absolute2DPosition(0, 0);
            startPosition.velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
            startPosition.velocity.linear = new LinearVelocity(1, 0, 0);
            startPosition.timestamp = currentTime;

            const object = new DataObject();
            object.setPosition(startPosition);
            currentTime += 1000;
            const frame = new DataFrame();
            frame.source = object;
            Promise.resolve(model.push(frame));
        });

        it('should not speed up when turning (with 1 intermediate calculation)', (done) => {
            // Meaning it should not speed up, the travelled distance should not
            // be higher than a direct path

            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                const distance = position.distanceTo(startPosition);
                expect(distance).to.be.below(0.5);
            };

            currentTime = 0;
            const startPosition = new Absolute2DPosition(0, 0);
            startPosition.velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
            startPosition.velocity.linear = new LinearVelocity(1, 0, 0);
            startPosition.timestamp = currentTime;

            const frame = new DataFrame();
            const object = new DataObject('robot');
            object.setPosition(startPosition);
            frame.source = object;

            model.push(frame).then(() => {
                currentTime += 500;
                model.findDataService(object).findByUID("robot").then(obj => {
                    return model.push(new DataFrame(obj));
                })
                .then(() => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
            });
        });

        it('should not slow down when turning (with 1 intermediate calculation)', (done) => {
            // Meaning it should not slow down, the travelled distance should not
            // be lower

            let distance = 0;
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getPosition() as Absolute2DPosition;
                distance = position.distanceTo(startPosition);
            };

            currentTime = 0;

            const startPosition = new Absolute2DPosition(0, 0);
            startPosition.velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
            startPosition.velocity.linear = new LinearVelocity(1, 0, 0);
            startPosition.timestamp = currentTime;

            const frame = new DataFrame();
            const object = new DataObject('robot');
            object.setPosition(startPosition);
            frame.source = object;

            model.push(frame).then(() => {
                const count = 100;
                let promise = Promise.resolve();
                for (let i = 1; i <= count; i++) {
                    currentTime = i * (1000 / count);
                    promise = promise.then(() =>
                        model.findDataService(object).findByUID("robot").then(obj => {
                            return model.push(new DataFrame(obj));
                        })
                        .then(() => {})
                        .catch(done),
                    );
                }

                promise
                    .then(() => {
                        expect(distance).to.be.above(0.8);
                        expect(distance).to.be.below(1.0);
                        done();
                    })
                    .catch(done);
            });
        });
    });
});
