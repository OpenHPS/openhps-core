import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, CallbackSinkNode } from '../../../src/nodes/sink';
import { Model, CallbackNode, ModelBuilder, GraphBuilder, CallbackSourceNode, ReferenceSpace, DataFrame, Absolute2DPosition, DataObject, ReferenceSpaceConversionNode } from '../../../src';

describe('node', () => {
    describe('referenceconversion', () => {
     
        it('should convert from and to the reference space', (done) => {
            const globalReferenceSpace = new ReferenceSpace(undefined);

            // Reference space used by our test node
            const myReferenceSpace = new ReferenceSpace(globalReferenceSpace)
                .translation(10, 10, 0);
            
            ModelBuilder.create()
                .withReferenceSpace(globalReferenceSpace)
                .addShape(GraphBuilder.create()
                    .from(new CallbackSourceNode()) // Source node merges stored data objects
                    .via(new ReferenceSpaceConversionNode(myReferenceSpace))
                    .via(new CallbackNode((frame: DataFrame) => {
                        const object = frame.getObjectByUID("test");
                        const position = object.getPosition() as Absolute2DPosition; // No reference space provided
                        // Since our reference space has a translation offset of 10,10,10
                        // We expect the position to be -7, -7
                        expect(position.x).to.equal(-7);
                        expect(position.y).to.equal(-7);
                    }))
                    .via(new ReferenceSpaceConversionNode(myReferenceSpace, true))
                    .to(new CallbackSinkNode()))    // Sink node stores data objects
                .build().then((model: Model) => {
                    const object = new DataObject("test");
                    // Set the current position in the global reference space
                    // to (3, 3)
                    object.setPosition(new Absolute2DPosition(3, 3));

                    model.push(new DataFrame(object)).then(() => {
                        return model.findDataService(ReferenceSpace).insert(myReferenceSpace);
                    }).then(() => {
                        done();
                    }).catch(ex => {
                        done(ex); // Exception
                    });
                });
        });

        it('should work with stored reference spaces', (done) => {
            const globalReferenceSpace = new ReferenceSpace(undefined);

            // Reference space used by our test node
            const myReferenceSpace = new ReferenceSpace(globalReferenceSpace)
                .translation(10, 10, 0);
            
            ModelBuilder.create()
                .withReferenceSpace(globalReferenceSpace)
                .addShape(GraphBuilder.create()
                    .from(new CallbackSourceNode()) // Source node merges stored data objects
                    .via(new ReferenceSpaceConversionNode(myReferenceSpace.uid))
                    .via(new CallbackNode((frame: DataFrame) => {
                        const object = frame.getObjectByUID("test");
                        const position = object.getPosition() as Absolute2DPosition; // No reference space provided
                        // Since our reference space has a translation offset of 10,10,10
                        // We expect the position to be -7, -7
                        expect(position.x).to.equal(-7);
                        expect(position.y).to.equal(-7);
                    }))
                    .convertFromSpace(myReferenceSpace.uid)
                    .to(new CallbackSinkNode()))    // Sink node stores data objects
                .build().then((model: Model) => {
                    const object = new DataObject("test");
                    // Set the current position in the global reference space
                    // to (3, 3)
                    object.setPosition(new Absolute2DPosition(3, 3));

                    const frame = new DataFrame(object);
                    frame.addReferenceSpace(myReferenceSpace);

                    model.push(frame).then(() => {
                        return model.findDataService(ReferenceSpace).insert(myReferenceSpace);
                    }).then(() => {
                        done();
                    }).catch(ex => {
                        done(ex); // Exception
                    });
                });
        });
    });
});