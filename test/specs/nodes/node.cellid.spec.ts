import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    DataObject,
    ListSourceNode,
    CellIdentificationNode,
    Absolute2DPosition,
    RelativeDistance,
    LoggingSinkNode,
    CallbackSinkNode
} from '../../../src';

describe('node cell identification', () => {
    it('should calculate a location based on three angles', (done) => {
        const beacon1 = new DataObject('b1');
        beacon1.setPosition(new Absolute2DPosition(1, 1));

        const beacon2 = new DataObject('b2');
        beacon2.setPosition(new Absolute2DPosition(1, 10));

        const beacon3 = new DataObject('b3');
        beacon3.setPosition(new Absolute2DPosition(10, 1));

        const sink = new CallbackSinkNode();
        ModelBuilder.create()
            .from()
            .via(new CellIdentificationNode())
            .to(sink)
            .build()
            .then((model) => {
                const frame = new DataFrame(new DataObject('phone'));
                frame.addObject(beacon1);
                frame.addObject(beacon2);
                frame.addObject(beacon3);
                frame.source.addRelativePosition(new RelativeDistance(beacon1, 3));
                frame.source.addRelativePosition(new RelativeDistance(beacon2, 2));
                frame.source.addRelativePosition(new RelativeDistance(beacon3, 0.8));
                sink.callback = (frame: DataFrame) => {
                    expect(frame.source.position.toVector3()).to.deep.equal(beacon3.position.toVector3());
                    done();
                };
                return model.push(frame);
            }).catch(done);
    });
});
