import { expect } from 'chai';
import 'mocha';
import {
    LoggingSinkNode,
    CallbackSinkNode,
    ModelBuilder,
    CallbackSourceNode,
    DataFrame,
    DataObject,
    FrameMergeNode,
    TimeUnit,
    PushOptions,
    Absolute2DPosition,
    AbsolutePosition,
} from '../../../../src';

describe('node', () => {
    describe('frame merge node', () => {
        it('should merge from multiple sources with same parent', (done) => {
            ModelBuilder.create()
                .from(
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc-1');
                        object.parentUID = 'abc';
                        frame.source = object;
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc-2');
                        object.parentUID = 'abc';
                        frame.source = object;
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc-3');
                        object.parentUID = 'abc';
                        frame.source = object;
                        return frame;
                    }),
                )
                .via(
                    new FrameMergeNode(
                        (frame: DataFrame) => frame.source.parentUID,
                        (frame: DataFrame) => frame.source.uid,
                    ),
                )
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        expect(frame.getObjects().length).to.equal(3);
                        expect(frame.getObjectByUID('abc-1').parentUID).to.equal('abc');
                        expect(frame.getObjectByUID('abc-2').parentUID).to.equal('abc');
                        expect(frame.getObjectByUID('abc-3').parentUID).to.equal('abc');
                        done();
                    }),
                )
                .build()
                .then((model) => {
                    Promise.resolve(model.pull()).finally(() => {
                        model.emit('destroy');
                    });
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should merge from multiple sources with same uid', (done) => {
            ModelBuilder.create()
                .from(
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(1, 1);
                        position.accuracy = 1;
                        object.setPosition(position);
                        frame.source = object;
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(0, 0);
                        position.accuracy = 1;
                        object.setPosition(position);
                        frame.source = object;
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(5, 5);
                        position.accuracy = 1;
                        object.setPosition(position);
                        frame.source = object;
                        return frame;
                    }),
                )
                .via(
                    new FrameMergeNode(
                        (frame: DataFrame, options: PushOptions) => frame.source.uid,
                        (frame: DataFrame, options: PushOptions) => options.sourceNode,
                    )
                )
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        expect(frame.source.getPosition().toVector3().x).to.equal(2);
                        expect(frame.getObjects().length).to.equal(1);
                        done();
                    }),
                )
                .build()
                .then((model) => {
                    Promise.resolve(model.pull()).finally(() => {
                        model.emit('destroy');
                    });
                })
                .catch((ex) => {
                    done(ex);
                });
        });
    });
});
