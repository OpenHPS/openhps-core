import { expect } from 'chai';
import 'mocha';
import {
    LoggingSinkNode,
    ModelBuilder,
    ListSourceNode,
    DataFrame,
    DataObject,
    Absolute2DPosition,
    RelativeAnglePosition,
    AngleUnit,
    TriangulationNode 
} from '../../../src';

describe('node', () => {
    describe('triangulation', () => {
        it('should calculate a location based on three angles', (done) => {
            const frames = [];
            frames.push(
                (() => {
                    const frame = new DataFrame();

                    const beacon1 = new DataObject('b1');
                    beacon1.setPosition(new Absolute2DPosition(1, 1));
                    frame.addObject(beacon1);

                    const beacon2 = new DataObject('b2');
                    beacon2.setPosition(new Absolute2DPosition(1, 10));
                    frame.addObject(beacon2);

                    const beacon3 = new DataObject('b3');
                    beacon3.setPosition(new Absolute2DPosition(10, 1));
                    frame.addObject(beacon3);

                    frame.source = new DataObject('phone');
                    frame.source.addRelativePosition(new RelativeAnglePosition(beacon1, 270, AngleUnit.DEGREE));
                    frame.source.addRelativePosition(new RelativeAnglePosition(beacon2, 90, AngleUnit.DEGREE));
                    frame.source.addRelativePosition(new RelativeAnglePosition(beacon3, 330, AngleUnit.DEGREE));

                    return frame;
                })(),
            );

            ModelBuilder.create()
                .from(new ListSourceNode(frames))
                .via(new TriangulationNode())
                .to(
                    new LoggingSinkNode((frame: DataFrame) => {
                        const location = frame.source.getPosition() as Absolute2DPosition;
                        expect(location.x).to.gt(0.9);
                        expect(location.x).to.lt(1.1);
                    }),
                )
                .build()
                .then((model) => {
                    Promise.resolve(model.pull()).then(() => {
                        done();
                    });
                });
        });
    });
});
