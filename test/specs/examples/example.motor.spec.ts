import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, CallbackSourceNode, CallbackSinkNode, DataFrame, GraphBuilder, DataObject, Absolute2DPosition, LinearVelocityUnit, VelocityProcessingNode, LinearVelocity } from '../../../src';

describe('example', () => {

    describe('motor', () => {
        let model: Model<any, any>;

        before((done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .from()
                    .via(new VelocityProcessingNode())
                    .to(new CallbackSinkNode((frame: DataFrame) => {
                        //console.log(frame.source);
                    })))
                .build().then((m: Model<any, any>) => {
                    model = m;

                    const robot = new DataObject("robot");
                    // Start location
                    robot.setCurrentPosition(new Absolute2DPosition(0, 0));

                    model.push(new DataFrame(robot)).then(() => {
                        done();
                    });
                });
        });

        it('should calculate moving forward', () =>{
            model.findDataService(DataObject).findByUID("robot").then(robot => {
                robot.getCurrentPosition().velocity.linear = new LinearVelocity(1, 0);
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
