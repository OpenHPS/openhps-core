import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, CallbackSourceNode, CallbackSinkNode, DataFrame, GraphBuilder, DataObject, Cartesian2DLocation, LinearVelocityUnit, VelocityProcessingNode } from '../../../src';

describe('example', () => {

    describe('motor', () => {
        let model: Model<any, any>;

        before((done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .from(new CallbackSourceNode(() => {

                        return null;
                    }))
                    .via(new VelocityProcessingNode())
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        console.log(frame.source);
                    })))
                .build().then((m: Model<any, any>) => {
                    model = m;

                    const robot = new DataObject("robot");
                    // Start location
                    robot.addPredictedLocation(new Cartesian2DLocation(0, 0));

                    model.push(new DataFrame(robot)).then(() => {
                        done();
                    });
                });
        });

        it('should calculate moving forward', () =>{
            model.findDataService(DataObject).findByUID("robot").then(robot => {
                robot.currentLocation.velocity.linearVelocity = [1, 0];
                robot.currentLocation.velocity.linearVelocityUnit = LinearVelocityUnit.METERS_PER_SECOND;
                Promise.resolve(model.push(new DataFrame(robot)));
            });

            setTimeout(() => {
                model.findDataService(DataObject).findByUID("robot").then(robot => {
                    Promise.resolve(model.push(new DataFrame(robot)));
                });
            }, 5000);
        });

    });

});
