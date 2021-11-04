import { expect } from 'chai';
import 'mocha';
import {
    Absolute2DPosition,
    AccuracyModifierNode,
    CallbackSinkNode,
    DataFrame,
    DataObject,
    LengthUnit,
    Model,
    ModelBuilder,
} from '../../../src';

describe('AccuracyModifierNode', () => {
    let model: Model<any, any>;
    const sink = new CallbackSinkNode();

    before(function (done) {
        ModelBuilder.create()
            .from()
            .via(
                new AccuracyModifierNode({
                    defaultValue: 0,
                    magnitude: 2,
                    offset: 2,
                    offsetUnit: LengthUnit.CENTIMETER,
                }),
            )
            .to(sink)
            .build()
            .then((m) => {
                model = m;
                done();
            })
            .catch(done);
    });

    it('should modify the accuracy', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.uid).to.eql('dummy');
            expect(frame.source.position.accuracy.valueOf()).to.eql(2.02); // 1 meter * 2 + 2 cm = 2.02
            done();
        };
        const object = new DataObject('dummy');
        object.setPosition(new Absolute2DPosition(3, 4));
        const frame = new DataFrame(object);
        model.push(frame);
    });
});
