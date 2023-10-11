import { expect } from 'chai';
import 'mocha';
import { CallbackSinkNode, DataFrame, DataObject, Model, ModelBuilder, RelativeDistance, RelativePositionFilter } from '../../../../src';

describe('RelativePositionFilter', () => {
    let model: Model;
    let sink = new CallbackSinkNode();

    before((done) => {
        ModelBuilder.create()
            .from()
            .via(new RelativePositionFilter(RelativeDistance, {
                A: 1, B: 1, C: 1, Q: 1, R: 1,
                minValue: 0,
                maxValue: 100,
                maxTimeDifference: 20000
            }))
            .to(sink)
            .build().then(m => {
                model = m;
                done();
            }).catch(done);
    });

    it('should not remove distances that are within the min and max', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.relativePositions.length === 2);
            done();
        };
        const frame = new DataFrame(new DataObject("abc"));
        frame.source.addRelativePosition(new RelativeDistance(new DataObject("1"), 10));
        frame.source.addRelativePosition(new RelativeDistance(new DataObject("2"), 20));
        frame.source.addRelativePosition(new RelativeDistance(new DataObject("3"), 120));
        model.push(frame);
    });
});
