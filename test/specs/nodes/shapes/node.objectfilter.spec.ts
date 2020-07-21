import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, CallbackSinkNode } from '../../../../src/nodes/sink';
import { DataFrame, DataObject, Absolute2DPosition, RelativeDistancePosition, ModelBuilder, ListSourceNode, SourceMergeNode, TimeUnit, FrameChunkNode } from '../../../../src';

describe('node', () => {
    describe('object filter', () => {

        it('should filter data objects', (done) => {
            ModelBuilder.create()
                .from()
                .filterObjects((object: DataObject) => { return object.uid.startsWith("a"); })
                .to(new CallbackSinkNode((data: DataFrame) => {
                    expect(data.source).to.not.be.undefined;
                    expect(data.source.uid.startsWith("a"));
                }))
                .build().then(model => {
                    Promise.all([model.push(new DataFrame(new DataObject("ab"))),
                        model.push(new DataFrame(new DataObject("c"))),
                        model.push(new DataFrame(new DataObject("ae")))]).then(() => {
                            done();
                    });
                });
        }).timeout(10000);

    });
});