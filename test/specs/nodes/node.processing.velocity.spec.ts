import { expect } from 'chai';
import 'mocha';
import { VelocityProcessingNode, DataFrame, DataObject, Absolute2DPosition, LinearVelocity, Model, ModelBuilder, CallbackSourceNode, StorageSinkNode, CallbackSinkNode, AngularVelocity } from '../../../src';

describe('node', () => {
    describe('processing velocity', () => {
        let model: Model;
        let callbackSink: CallbackSinkNode<DataFrame>;

        before((done) => {
            callbackSink = new CallbackSinkNode();
            ModelBuilder.create()
                .from(new CallbackSourceNode())
                .via(new VelocityProcessingNode())
                .to(callbackSink)
                .build().then(m => {
                    model = m;
                    done();
                });
        });

        it('should process linear velocity', (done) => {
            callbackSink.callback = (frame: DataFrame) => {
                const position = frame.source.getCurrentPosition();
                expect(position.point[0]).to.equal(5);
                expect(position.point[1]).to.equal(5);
                done();
            };

            const frame = new DataFrame();
            const object = new DataObject();
            object.setCurrentPosition(new Absolute2DPosition(3, 3));
            object.getCurrentPosition().velocity.linear = new LinearVelocity(2, 2);
            frame.source = object;

            Promise.resolve(model.push(frame));
        });

        // it('should process angular velocity on the linear movement', (done) => {
        //     callbackSink.callback = (frame: DataFrame) => {
        //         const position = frame.source.getCurrentPosition();
        //         expect(position.point[0]).to.equal(5);
        //         expect(position.point[1]).to.equal(5);
        //         done();
        //     };

        //     const frame = new DataFrame();
        //     const object = new DataObject();
        //     object.setCurrentPosition(new Absolute2DPosition(3, 3));
        //     object.getCurrentPosition().velocity.angular = new AngularVelocity();
        //     frame.source = object;

        //     Promise.resolve(model.push(frame));
        // });

    });

});