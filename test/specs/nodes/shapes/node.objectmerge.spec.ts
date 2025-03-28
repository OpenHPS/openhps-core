import { expect } from 'chai';
import 'mocha';
import {
    CallbackSinkNode,
    ModelBuilder,
    CallbackSourceNode,
    DataFrame,
    DataObject,
    PushOptions,
    Absolute2DPosition,
    ObjectMergeNode,
} from '../../../../src';

describe('node', () => {
    describe('object merge node', () => {
        it('should merge from multiple sources with same uid', (done) => {
            ModelBuilder.create()
                .from(
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(1, 1);
                        position.setAccuracy(1);
                        object.setPosition(position);
                        frame.source = object;
                        frame.addObject(new DataObject('random1'));
                        frame.addObject(new DataObject('random2'));
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(0, 0);
                        position.setAccuracy(1);
                        object.setPosition(position);
                        frame.source = object;
                        frame.addObject(new DataObject('random3'));
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(5, 5);
                        position.setAccuracy(1);
                        object.setPosition(position);
                        frame.source = object;
                        frame.addObject(new DataObject('random4'));
                        return frame;
                    }),
                )
                .via(new ObjectMergeNode((frame: DataFrame, options: PushOptions) => options.sourceNode))
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        expect(frame.source.getPosition().toVector3().x).to.equal(2);
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

        it('should merge from multiple sources with same uid and different accuracies', (done) => {
            ModelBuilder.create()
                .from(
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(1, 1);
                        position.setAccuracy(1);
                        object.setPosition(position);
                        frame.source = object;
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(2, 2);
                        position.setAccuracy(2);
                        object.setPosition(position);
                        frame.source = object;
                        return frame;
                    }),
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame();
                        const object = new DataObject('abc');
                        const position = new Absolute2DPosition(500, 500);
                        position.setAccuracy(5000);
                        object.setPosition(position);
                        frame.source = object;
                        return frame;
                    }),
                )
                .via(new ObjectMergeNode((frame: DataFrame, options: PushOptions) => options.sourceNode))
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        expect(frame.source.getPosition().toVector3().x).to.lt(2);
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
