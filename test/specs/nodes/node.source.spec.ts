import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    CallbackSourceNode,
    DataObject,
    Absolute2DPosition,
    CallbackSinkNode,
    Model,
    LinearVelocity,
    Vector3,
    ListSourceNode,
} from '../../../src';

describe('node source', () => {
    it('should support pulling a specific source node', (done) => {
        ModelBuilder.create()
            .from(
                new CallbackSourceNode(
                    () => {
                        return new DataFrame(new DataObject('1'));
                    },
                    {
                        uid: '1',
                    },
                ),
                new CallbackSourceNode(
                    () => {
                        return new DataFrame(new DataObject('2'));
                    },
                    {
                        uid: '2',
                    },
                ),
                new CallbackSourceNode(
                    () => {
                        return new DataFrame(new DataObject('3'));
                    },
                    {
                        uid: '3',
                    },
                ),
            )
            .to(
                new CallbackSinkNode((frame) => {
                    expect(frame.source.uid).to.equal('2');
                    done();
                }),
            )
            .build()
            .then((model) => {
                model.on('error', done);
                return model.pull({
                    sourceNode: '2',
                });
            })
            .catch(done);
    });

    it('should initialize with a source object', (done) => {
        const callbackNode = new CallbackSinkNode();
        ModelBuilder.create()
            .from(
                new CallbackSourceNode(() => undefined, {
                    source: new DataObject('123'),
                }),
            )
            .to(callbackNode)
            .build()
            .then(() => {
                done();
            });
    });

    it('should be able to update velocity without resetting the position', (done) => {
        const callbackNode = new CallbackSinkNode();
        ModelBuilder.create()
            .from(
                new CallbackSourceNode(function () {
                    return new Promise<DataFrame>((resolve, reject) => {
                        (this.graph as Model)
                            .findDataService(DataObject)
                            .findByUID('test')
                            .then((stored) => {
                                const position = stored.getPosition();
                                position.velocity.linear = new LinearVelocity(1, 0, 0);
                                stored.setPosition(position);
                                resolve(new DataFrame(stored));
                            })
                            .catch((ex) => {
                                reject(ex);
                            });
                    });
                }),
            )
            .to(callbackNode)
            .build()
            .then((model) => {
                const object = new DataObject('test');
                object.setPosition(new Absolute2DPosition(3, 3));

                model.once('completed', () => {
                    callbackNode.callback = (frame: DataFrame) => {
                        expect(frame.source.getPosition().toVector3()).to.eql(new Vector3(3, 3));
                        expect(frame.source.getPosition().linearVelocity.x).to.equal(1);
                        done();
                    };
                    Promise.resolve(
                        model.pull({
                            sequential: false,
                        }),
                    );
                });

                model.push(new DataFrame(object));
            });
    });
});
