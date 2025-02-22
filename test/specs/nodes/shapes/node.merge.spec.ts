import { expect } from 'chai';
import 'mocha';
import {
    LoggingSinkNode,
    DataFrame,
    DataObject,
    Absolute2DPosition,
    ModelBuilder,
    ListSourceNode,
    SourceMergeNode,
    RelativeDistance,
} from '../../../../src';

describe('node', () => {
    describe('source merge', () => {
        it('should merge data object from the same source uid', (done) => {
            const beacon = new DataObject('b1');

            const frameA = new DataFrame();
            frameA.source = new DataObject('abc');
            frameA.source.addRelativePosition(new RelativeDistance(beacon, 10));

            const frameB = new DataFrame();
            frameB.source = new DataObject('abc');
            frameB.source.setPosition(new Absolute2DPosition(3, 4));

            ModelBuilder.create()
                .from(new ListSourceNode([frameA]), new ListSourceNode([frameB]))
                .via(new SourceMergeNode())
                .to(
                    new LoggingSinkNode((data: DataFrame) => {
                        done();
                    }),
                )
                .build()
                .then((model) => {
                    Promise.resolve(model.pull());
                    model.emit('destroy');
                });
        });
    });
});
