import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode } from '../../../src/nodes/sink';
import { ModelBuilder, ListSourceNode, DataFrame, DataObject, Cartesian2DLocation, RelativeAngleLocation, AngleUnit, TriangulationNode } from '../../../src';

describe('node', () => {
    describe('triangulation', () => {

        it('should calculate a location based on three angles', (done) => {
            const frames = new Array();
            frames.push((() => {
                const frame = new DataFrame();
                
                const beacon1 = new DataObject("b1");
                beacon1.currentLocation = new Cartesian2DLocation(1, 1);
                frame.addObject(beacon1);

                const beacon2 = new DataObject("b2");
                beacon2.currentLocation = new Cartesian2DLocation(1, 10);
                frame.addObject(beacon2);

                const beacon3 = new DataObject("b3");
                beacon3.currentLocation = new Cartesian2DLocation(10, 1);
                frame.addObject(beacon3);

                frame.source = new DataObject("phone");
                frame.source.addRelativeLocation(new RelativeAngleLocation(beacon1, 270, AngleUnit.DEGREES));
                frame.source.addRelativeLocation(new RelativeAngleLocation(beacon2, 90, AngleUnit.DEGREES));
                frame.source.addRelativeLocation(new RelativeAngleLocation(beacon3, 330, AngleUnit.DEGREES));

                return frame;
            })());

            ModelBuilder.create()
                .from(new ListSourceNode(frames))
                .via(new TriangulationNode())
                .to(new LoggingSinkNode((frame: DataFrame) => {
                    const location = frame.source.predictedLocations[0] as Cartesian2DLocation;
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