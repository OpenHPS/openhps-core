import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, CallbackSinkNode } from '../../../src/nodes/sink';
import { Model, CallbackNode, ModelBuilder, GraphBuilder, CallbackSourceNode, ReferenceSpace, DataFrame, Absolute2DPosition, DataObject } from '../../../src';

describe('node', () => {
    describe('referenceconversion', () => {
     
        it('should convert from and to the ference space', (done) => {
            const globalReferenceSpace = new ReferenceSpace(undefined);

            // Reference space used by our test node
            const myReferenceSpace = new ReferenceSpace(globalReferenceSpace)
                .translation(10, 10, 0);

            ModelBuilder.create()
                .withReferenceSpace(globalReferenceSpace)
                .addShape(GraphBuilder.create()
                    .from(new CallbackSourceNode()) // Source node merges stored data objects
                    .viaToReferenceSpace(myReferenceSpace)   // Convert to the space used by our test node
                    .via(new CallbackNode((frame: DataFrame) => {
                        const object = frame.getObjectByUID("test");
                        const position = object.getCurrentPosition() as Absolute2DPosition; // No reference space provided
                        // Since our reference space has a translation offset of 10,10,10
                        // We expect the position to be -7, -7
                        expect(position.x).to.equal(-7);
                        expect(position.y).to.equal(-7);
                    }))
                    .viaFromReferenceSpace(myReferenceSpace) // Convert back to normal space
                    .to(new CallbackSinkNode()))    // Sink node stores data objects
                .build().then((model: Model) => {
                    const object = new DataObject("test");
                    // Set the current position in the global reference space
                    // to (3, 3)
                    object.setCurrentPosition(new Absolute2DPosition(3, 3));

                    model.push(new DataFrame(object)).then(() => {
                        done(); // No errors
                    }).catch(ex => {
                        done(ex); // Exception
                    });
                });
        });

    });
});