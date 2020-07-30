import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataFrame, CallbackSourceNode, DataObject, Absolute2DPosition, CallbackSinkNode, Model, LinearVelocity } from '../../../src';

describe('node source', () => {

    it('should be able to update velocity without resetting the position', (done) => {
        const callbackNode = new CallbackSinkNode();
        ModelBuilder.create()
            .from(new CallbackSourceNode(function() {
                return new Promise<DataFrame>((resolve, reject) => {
                    (this.graph as Model).findDataService(DataObject).findByUID("test").then(stored => {
                        const position = stored.getPosition();
                        position.velocity.linear = new LinearVelocity(1, 0, 0);
                        stored.setPosition(position);
                        resolve(new DataFrame(stored));
                    }).catch(ex => {
                        reject(ex);
                    });
                });
            }))
            .to(callbackNode)
            .build().then(model => {
                const object = new DataObject("test");
                object.setPosition(new Absolute2DPosition(3, 3));
                model.push(new DataFrame(object)).then(() => {
                    callbackNode.callback = (frame: DataFrame) => {
                        expect(frame.source.getPosition().toVector()).to.eql([3, 3]);
                        expect(frame.source.getPosition().velocity.linear.x).to.equal(1);
                        done();
                    };
                    Promise.resolve(model.pull());
                });
            });
    });

});