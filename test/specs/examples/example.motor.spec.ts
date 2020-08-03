import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, CallbackSinkNode, DataFrame, GraphBuilder, DataObject, Absolute2DPosition, LinearVelocityUnit, VelocityProcessingNode, LinearVelocity, TimeUnit, AngularVelocity, AngularVelocityUnit, AngleUnit, TimeService } from '../../../src';

describe('example', () => {

    describe('motor', () => {
        let model: Model<any, any>;
        let currentTime = 0;

        before((done) => {
            ModelBuilder.create()
                .addService(new TimeService(() => currentTime, TimeUnit.SECOND))
                .addShape(GraphBuilder.create()
                    .from()
                    .via(new VelocityProcessingNode())
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        
                    })))
                .build().then((m: Model<any, any>) => {
                    model = m;

                    const robot = new DataObject("robot");
                    // Start location
                    const position = new Absolute2DPosition(0, 0);
                    position.timestamp = currentTime;
                    robot.setPosition(position);

                    model.push(new DataFrame(robot)).then(() => {
                        currentTime++;
                        done();
                    });
                });
        });

        it('should calculate moving forward', (done) =>{
            model.findDataService(DataObject).findByUID("robot").then(robot => {
                const position = robot.getPosition();
                position.fromVector([0, 0]);
                position.velocity.linear = new LinearVelocity(1, 0);
                position.timestamp = currentTime;
                robot.setPosition(position);
                return model.push(new DataFrame(robot))
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                expect(position.x).to.equal(1);
                expect(position.y).to.equal(0);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                expect(position.x).to.equal(2);
                expect(position.y).to.equal(0);
                done();
            }).catch(ex => {
                done(ex);
            });
        });

        it('should calculate turning', (done) =>{
            model.findDataService(DataObject).findByUID("robot").then(robot => {
                const position = robot.getPosition();
                position.fromVector([0, 0]);
                position.velocity.linear = new LinearVelocity(0, 0, 0);
                position.velocity.angular = new AngularVelocity(10, 0, 0, AngularVelocityUnit.DEGREES_PER_SECOND);
                position.timestamp = currentTime;
                robot.setPosition(position);
                return model.push(new DataFrame(robot))
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                expect(position.x).to.equal(0);
                expect(position.y).to.equal(0);
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREES);
                expect(Math.round(orientation[0])).to.equal(10);
                expect(Math.round(orientation[1])).to.equal(0);
                expect(Math.round(orientation[2])).to.equal(0);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                expect(position.x).to.equal(0);
                expect(position.y).to.equal(0);
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREES);
                expect(Math.round(orientation[0])).to.equal(20);
                expect(Math.round(orientation[1])).to.equal(0);
                expect(Math.round(orientation[2])).to.equal(0);
                done();
            }).catch(ex => {
                done(ex);
            });
        });

        it('should calculate turning movement', (done) =>{
            model.findDataService(DataObject).findByUID("robot").then(robot => {
                const position = robot.getPosition();
                position.fromVector([0, 0]);
                position.velocity.linear = new LinearVelocity(1, 0, 0);
                position.velocity.angular = new AngularVelocity(0, 0, 10, AngularVelocityUnit.DEGREES_PER_SECOND);
                position.timestamp = currentTime;
                robot.setPosition(position);
                return model.push(new DataFrame(robot))
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREES);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREES);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREES);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREES);
                done();
            }).catch(ex => {
                done(ex);
            });
        });

    });

});
