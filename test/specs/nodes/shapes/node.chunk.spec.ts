import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, CallbackSinkNode } from '../../../../src/nodes/sink';
import { DataFrame, DataObject, Absolute2DPosition, RelativeDistancePosition, ModelBuilder, ListSourceNode, SourceMergeNode, TimeUnit, FrameChunkNode } from '../../../../src';

describe('node', () => {
    describe('frame chunk', () => {

        it('should chunk data frames in frames of 3', (done) => {
            ModelBuilder.create()
                .from()
                .chunk(3)
                .to(new CallbackSinkNode((data: DataFrame[]) => {
                    expect(data.length).to.equal(3);
                    done();
                }))
                .build().then(model => {
                    Promise.all([model.push(new DataFrame(new DataObject("a"))),
                        model.push(new DataFrame(new DataObject("b"))),
                        model.push(new DataFrame(new DataObject("c"))),
                        model.push(new DataFrame(new DataObject("d"))),
                        model.push(new DataFrame(new DataObject("e")))]).then(() => {

                    });
                });
        });

    });
});