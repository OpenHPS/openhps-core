import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode } from '../../../src/nodes/sink';
import { ModelBuilder, ListSourceNode, DataFrame, DataObject, Cartesian2DPosition, RelativeAnglePosition, AngleUnit, TriangulationNode } from '../../../src';

describe('node', () => {
    describe('triangulation', () => {

        it('should calculate a location based on three angles', (done) => {
            const frames = new Array();
            frames.push((() => {
                const frame = new DataFrame();
                
                const beacon1 = new DataObject("b1");
                beacon1.currentPosition = new Cartesian2DPosition(1, 1);
                frame.addObject(beacon1);

                const beacon2 = new DataObject("b2");
                beacon2.currentPosition = new Cartesian2DPosition(1, 10);
                frame.addObject(beacon2);

                const beacon3 = new DataObject("b3");
                beacon3.currentPosition = new Cartesian2DPosition(10, 1);
                frame.addObject(beacon3);

                frame.source = new DataObject("phone");
                frame.source.addRelativePosition(new RelativeAnglePosition(beacon1, 270, AngleUnit.DEGREES));
                frame.source.addRelativePosition(new RelativeAnglePosition(beacon2, 90, AngleUnit.DEGREES));
                frame.source.addRelativePosition(new RelativeAnglePosition(beacon3, 330, AngleUnit.DEGREES));

                return frame;
            })());

            ModelBuilder.create()
                .from(new ListSourceNode(frames))
                .via(new TriangulationNode())
                .to(new LoggingSinkNode((frame: DataFrame) => {
                    const location = frame.source.currentPosition as Cartesian2DPosition;
                    expect(location.x).to.gt(0.9);
                    expect(location.x).to.lt(1.1);
                }))
                .build().then(model => {
                    Promise.resolve(model.pull()).then(() => {
                        done();
                    });
                });
        });

    });
});