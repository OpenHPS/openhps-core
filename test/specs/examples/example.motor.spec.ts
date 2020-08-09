import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, CallbackSinkNode, DataFrame, GraphBuilder, DataObject, Absolute2DPosition, LinearVelocityUnit, VelocityProcessingNode, LinearVelocity, TimeUnit, AngularVelocity, AngularVelocityUnit, AngleUnit, TimeService, Quaternion } from '../../../src';

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
                const position = robot.getPosition() as Absolute2DPosition;
                position.x = 0;
                position.y = 0;
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
                const position = robot.getPosition() as Absolute2DPosition;
                position.x = 0;
                position.y = 0;
                position.velocity.linear = new LinearVelocity(0, 0, 0);
                position.velocity.angular = new AngularVelocity(10, 0, 0, AngularVelocityUnit.DEGREE_PER_SECOND);
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
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREE);
                expect(Math.round(orientation.x)).to.equal(10);
                expect(Math.round(orientation.y)).to.equal(0);
                expect(Math.round(orientation.z)).to.equal(0);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                expect(position.x).to.equal(0);
                expect(position.y).to.equal(0);
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREE);
                expect(Math.round(orientation.x)).to.equal(20);
                expect(Math.round(orientation.y)).to.equal(0);
                expect(Math.round(orientation.z)).to.equal(0);
                done();
            }).catch(ex => {
                done(ex);
            });
        });

        it('should calculate turning movement', (done) =>{
            model.findDataService(DataObject).findByUID("robot").then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                position.x = 0;
                position.y = 0;
                position.orientation = new Quaternion();
                position.velocity.linear = new LinearVelocity(1, 0, 0);
                position.velocity.angular = new AngularVelocity(0, 0, 0, AngularVelocityUnit.DEGREE_PER_SECOND);
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
            }).then(robot => {  // Should have moved 1 forward
                const position = robot.getPosition() as Absolute2DPosition;
                expect(position.x).to.equal(1);
                expect(position.y).to.equal(0);
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREE);
                expect(Math.round(orientation.x)).to.equal(0);
                expect(Math.round(orientation.y)).to.equal(0);
                expect(Math.round(orientation.z)).to.equal(0);
                position.velocity.linear = new LinearVelocity(1, 0, 0);
                position.velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {  // Should have turned left
                const position = robot.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x)).to.equal(2);
                expect(Math.round(position.y)).to.equal(1);
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREE);
                expect(Math.round(orientation.x)).to.equal(0);
                expect(Math.round(orientation.y)).to.equal(0);
                expect(Math.round(orientation.z)).to.equal(90);
                position.velocity.linear = new LinearVelocity(2, -2, 0);
                position.velocity.angular = new AngularVelocity(0, 0, 0, AngularVelocityUnit.DEGREE_PER_SECOND);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {  // Should move 2 forward and 2 to right (diagonal right) using the previous orientation
                const position = robot.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x)).to.equal(4);
                expect(Math.round(position.y)).to.equal(3);
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREE);
                expect(Math.round(orientation.x)).to.equal(0);
                expect(Math.round(orientation.y)).to.equal(0);
                expect(Math.round(orientation.z)).to.equal(90);
                position.velocity.linear = new LinearVelocity(2, 0, 0);
                position.velocity.angular = new AngularVelocity(0, 0, 90, AngularVelocityUnit.DEGREE_PER_SECOND);
                return model.push(new DataFrame(robot));
            }).then(() => {
                currentTime++;
                return model.findDataService(DataObject).findByUID("robot");
            }).then(robot => {
                const position = robot.getPosition() as Absolute2DPosition;
                expect(Math.round(position.x)).to.equal(2);
                expect(Math.round(position.y)).to.equal(4);
                const orientation = position.orientation.toEuler().toVector(AngleUnit.DEGREE);
                expect(Math.round(orientation.x)).to.equal(0);
                expect(Math.round(orientation.y)).to.equal(0);
                expect(Math.round(orientation.z)).to.equal(180);
                done();
            }).catch(ex => {
                done(ex);
            });
        });

    });

});
