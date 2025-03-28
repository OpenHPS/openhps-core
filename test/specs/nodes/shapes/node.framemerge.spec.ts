import { expect } from 'chai';
import 'mocha';
import {
    CallbackSinkNode,
    ModelBuilder,
    CallbackSourceNode,
    DataFrame,
    DataObject,
    FrameMergeNode,
    PushOptions,
    Absolute2DPosition,
    LinearVelocity,
    GraphBuilder,
    CallbackNode,
    RelativeDistance,
    TimeService,
    TimeUnit,
} from '../../../../src';
import { Quaternion } from '../../../../src/utils/math/';

describe('FrameMergeNode', () => {
    before(() => {
        TimeService.initialize();
    });

    it('should support merging from same source', (done) => {
        let frames = 0;
        ModelBuilder.create()
            .addShape(GraphBuilder.create().from().clone().to('a'))
            .addShape(GraphBuilder.create().from().clone().to('b'))
            .addShape(GraphBuilder.create().from().clone().to('c'))
            .from('a', 'b', 'c')
            .via(
                new FrameMergeNode(
                    (frame) => frame.source.uid,
                    (frame, options) => options.lastNode,
                    {
                        timeout: 100,
                        minCount: 1,
                    },
                ),
            )
            .to(
                new CallbackSinkNode((frame) => {
                    frames++;
                }),
            )
            .build()
            .then((model) => {
                const object = new DataObject('test');
                //object.setPosition(new Absolute2DPosition(0, 0));
                const frame = new DataFrame(object);
                model.onceCompleted(frame.uid).then(() => {
                    model.destroy();
                    expect(frames).to.equal(1);
                    done();
                });
                return model.push(frame);
            })
            .catch(done);
    });

    it('should support merging with one inlet', (done) => {
        const frames = 0;
        ModelBuilder.create()
            .addShape(GraphBuilder.create().from('i_a').clone().to('a'))
            .addShape(GraphBuilder.create().from('i_b').clone().to('b'))
            .addShape(GraphBuilder.create().from('i_c').clone().to('c'))
            .from('a', 'b', 'c')
            .via(new CallbackNode())
            .via(
                new FrameMergeNode(
                    (frame) => true,
                    (frame, options) => frame.uid,
                    {
                        timeout: 2000,
                        minCount: 1,
                        maxCount: 4,
                    },
                ),
            )
            .to(
                new CallbackSinkNode(function (frame: DataFrame) {
                    expect(frame.getObjects().length).to.equal(3);
                    this.model.destroy();
                    done();
                }),
            )
            .build()
            .then((model) => {
                model.findNodeByName('i_a').push(new DataFrame(new DataObject('1')));
                model.findNodeByName('i_b').push(new DataFrame(new DataObject('2')));
                model.findNodeByName('i_c').push(new DataFrame(new DataObject('3')));
            })
            .catch(done);
    });

    it('should support merging relative positions with one inlet', (done) => {
        const frames = 0;
        ModelBuilder.create()
            .addShape(GraphBuilder.create().from('i_a').clone().to('a'))
            .addShape(GraphBuilder.create().from('i_b').clone().to('b'))
            .addShape(GraphBuilder.create().from('i_c').clone().to('c'))
            .from('a', 'b', 'c')
            .via(new CallbackNode())
            .via(
                new FrameMergeNode(
                    (frame) => true,
                    (frame, options) => frame.uid,
                    {
                        timeout: 2000,
                        minCount: 1,
                        maxCount: 4,
                    },
                ),
            )
            .to(
                new CallbackSinkNode(function (frame: DataFrame) {
                    expect(frame.getObjects().length).to.equal(1);
                    expect(frame.source.relativePositions.length).to.equal(3);
                    this.model.destroy();
                    done();
                }),
            )
            .build()
            .then((model) => {
                model
                    .findNodeByName('i_a')
                    .push(new DataFrame(new DataObject('1').addRelativePosition(new RelativeDistance('a', 1))));
                model
                    .findNodeByName('i_b')
                    .push(new DataFrame(new DataObject('1').addRelativePosition(new RelativeDistance('b', 21))));
                model
                    .findNodeByName('i_c')
                    .push(new DataFrame(new DataObject('1').addRelativePosition(new RelativeDistance('c', 13))));
            })
            .catch(done);
    });

    it('should support merging of a position', (done) => {
        let frames = 0;
        ModelBuilder.create()
            .addShape(GraphBuilder.create().from().clone().to('a'))
            .addShape(GraphBuilder.create().from().clone().to('b'))
            .addShape(
                GraphBuilder.create()
                    .from()
                    .clone()
                    .via(
                        new CallbackNode((frame) => {
                            frame.source.position.orientation = new Quaternion();
                        }),
                    )
                    .to('c'),
            )
            .from('a', 'b', 'c')
            .via(
                new FrameMergeNode(
                    (frame) => frame.source.uid,
                    (frame, options) => options.lastNode,
                    {
                        timeout: 100,
                        minCount: 1,
                    },
                ),
            )
            .to(
                new CallbackSinkNode((frame) => {
                    frames++;
                }),
            )
            .build()
            .then((model) => {
                const object = new DataObject('test');
                object.setPosition(new Absolute2DPosition(0, 0));
                const frame = new DataFrame(object);
                model.onceCompleted(frame.uid).then(() => {
                    model.destroy();
                    expect(frames).to.equal(1);
                    done();
                });
                model.push(frame);
            });
    });

    it('should support merging one frame from multiple inlets', (done) => {
        ModelBuilder.create()
            .addShape(GraphBuilder.create().from().clone().to('a'))
            .addShape(
                GraphBuilder.create()
                    .from()
                    .clone()
                    .filter(() => false)
                    .to('b'),
            )
            .addShape(
                GraphBuilder.create()
                    .from()
                    .clone()
                    .filter(() => false)
                    .to('c'),
            )
            .from('a', 'b', 'c')
            .via(
                new FrameMergeNode(
                    (frame) => frame.source.uid,
                    (frame, options) => options.lastNode,
                    {
                        timeout: 100,
                        minCount: 1,
                    },
                ),
            )
            .to(new CallbackSinkNode((frame) => {}))
            .build()
            .then((model) => {
                const object = new DataObject('test');
                object.setPosition(new Absolute2DPosition(0, 0));
                const frame = new DataFrame(object);
                model
                    .onceCompleted(frame.uid)
                    .then(() => {
                        model.destroy();
                        done();
                    })
                    .catch(done);
                model.push(frame);
            });
    });

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
                    position.accuracy.value = 1;
                    position.linearVelocity = new LinearVelocity(2, 2);
                    object.setPosition(position);
                    frame.source = object;
                    return frame;
                }),
                new CallbackSourceNode(() => {
                    const frame = new DataFrame();
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(0, 0);
                    position.accuracy.value = 1;
                    position.linearVelocity = new LinearVelocity(1, 1);
                    object.setPosition(position);
                    frame.source = object;
                    return frame;
                }),
                new CallbackSourceNode(() => {
                    const frame = new DataFrame();
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(5, 5);
                    position.linearVelocity = new LinearVelocity(6, 6);
                    position.accuracy.value = 1;
                    object.setPosition(position);
                    frame.source = object;
                    return frame;
                }),
            )
            .via(
                new FrameMergeNode(
                    (frame: DataFrame, options: PushOptions) => frame.source.uid,
                    (frame: DataFrame, options: PushOptions) => options.sourceNode,
                ),
            )
            .to(
                new CallbackSinkNode((frame: DataFrame) => {
                    expect(frame.source.getPosition().linearVelocity.x).to.equal(3);
                    expect(frame.source.getPosition().toVector3().x).to.equal(2);
                    expect(frame.getObjects().length).to.equal(1);
                    done();
                }),
            )
            .build()
            .then((model) => {
                model.once('error', done);
                Promise.resolve(model.pull()).finally(() => {
                    model.emit('destroy');
                });
            })
            .catch((ex) => {
                done(ex);
            });
    });

    it('should merge from many multiple sources with same uid', (done) => {
        ModelBuilder.create()
            .from(
                new CallbackSourceNode(() => {
                    const frame = new DataFrame();
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(1, 1);
                    position.accuracy.value = 1;
                    position.linearVelocity = new LinearVelocity(2, 2);
                    object.setPosition(position);
                    frame.source = object;
                    return frame;
                }),
                new CallbackSourceNode(() => {
                    const frame = new DataFrame();
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(0, 0);
                    position.accuracy.value = 1;
                    position.linearVelocity = new LinearVelocity(1, 1);
                    object.setPosition(position);
                    frame.source = object;
                    return frame;
                }),
                new CallbackSourceNode(() => {
                    const frame = new DataFrame();
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(5, 5);
                    position.linearVelocity = new LinearVelocity(6, 6);
                    position.accuracy.value = 1;
                    object.setPosition(position);
                    frame.source = object;
                    return frame;
                }),
                new CallbackSourceNode(() => {
                    const frame = new DataFrame();
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(3, 3);
                    position.linearVelocity = new LinearVelocity(1, 1);
                    position.accuracy.value = 1;
                    object.setPosition(position);
                    frame.source = object;
                    return frame;
                }),
            )
            .via(
                new FrameMergeNode(
                    (frame: DataFrame, options: PushOptions) => frame.source.uid,
                    (frame: DataFrame, options: PushOptions) => options.sourceNode,
                ),
            )
            .to(
                new CallbackSinkNode((frame: DataFrame) => {
                    expect(frame.source.getPosition().linearVelocity.x).to.equal(2.2);
                    expect(frame.getObjects().length).to.equal(1);
                    done();
                }),
            )
            .build()
            .then((model) => {
                model.once('error', done);
                Promise.resolve(model.pull()).finally(() => {
                    model.emit('destroy');
                });
            })
            .catch((ex) => {
                done(ex);
            });
    });

    it('should merge relative positions of the same object', (done) => {
        function createFrame(beacon: string, distance: number) {
            const frame = new DataFrame(new DataObject("phone"));
            frame.source.addRelativePosition(new RelativeDistance(new DataObject(beacon), distance));
            return frame;
        }

        ModelBuilder.create()
            .from("input")
            .via(new FrameMergeNode((frame) => frame.source.uid, (frame) => frame.uid, {
                timeout: 2000,                      // After 1000ms, push the frame
                timeoutUnit: TimeUnit.MILLISECOND,
                minCount: 1,                        // Minimum amount of frames to receive
                maxCount: 9                         // Max count can be as big as you want
                // if exceeded, frame will be pushed. If left out, it will take the amount of 
                // incomming nodes as the maxCount (which is 1, meaning the frame merge node is useless)
            }))
            .to(
                new CallbackSinkNode((frame: DataFrame) => {
                    // We expect 3 relative positions
                    const relativePositions = frame.source.getRelativePositions();
                    expect(relativePositions.length).to.eq(3);
                    expect(relativePositions[0].referenceObjectUID).to.eq("a");
                    expect(relativePositions[1].referenceObjectUID).to.eq("b");
                    expect(relativePositions[2].referenceObjectUID).to.eq("c");

                    expect(relativePositions[0].referenceValue).to.eq(1);
                    expect(relativePositions[1].referenceValue).to.eq(2);
                    expect(relativePositions[2].referenceValue).to.eq(3);
                    done();
                }),
            )
            .build()
            .then((model) => {
                const input = model.findNodeByName("input");

                // Code to stop test if sink throws error
                input.once('error', done);

                Promise.all([
                    input.push(createFrame("a", 1)),
                    input.push(createFrame("b", 2)),
                    input.push(createFrame("c", 3))
                ]);
                
                setTimeout(() => {
                    model.emit('destroy');
                }, 5000);
            })
            .catch((ex) => {
                done(ex);
            });
    }).timeout(60000);

});
