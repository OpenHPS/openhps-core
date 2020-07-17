import { expect } from 'chai';
import 'mocha';
import { ReferenceSpace, AngleUnit, Model, ModelBuilder, GraphBuilder, CallbackNode, DataFrame, DataObject, Absolute3DPosition, SinkNode, CallbackSinkNode } from '../../../src';
import * as math from 'mathjs';

describe('data', () => {
    describe('reference space', () => {
        describe('translation', () => {

            it('should shift position', () => {
                let refSpace = new ReferenceSpace()
                    .translation(2.0, 2.0, 2.0);
                let result = math.multiply([3, 3, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.equal(5);
                expect(result[1]).to.equal(5);
                expect(result[2]).to.equal(2);
            });

        });

        describe('scaling', () => {

            it('should scale up', () => {
                let refSpace = new ReferenceSpace()
                    .scale(2.0, 2.0, 2.0);
                let result = math.multiply([3, 3, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.equal(6);
                expect(result[1]).to.equal(6);
                expect(result[2]).to.equal(0);
            });

            it('should scale down', () => {
                let globalReferenceSpace = new ReferenceSpace();
    
                let refSpace = new ReferenceSpace()
                    .scale(0.5, 0.5, 0.5);
                let result = math.multiply([3, 3, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.equal(1.5);
                expect(result[1]).to.equal(1.5);
                expect(result[2]).to.equal(0);
            });

        });

        describe('rotation', () => {

            it('should rotate on X axis', () => {
                let refSpace = new ReferenceSpace()
                    .rotation(180, 0, 0, AngleUnit.DEGREES);
                let result = math.multiply([2, 2, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.within(-2.1, -1.9);
                expect(result[1]).to.within(-2.1, -1.9);
                expect(result[2]).to.equal(0);
            });

        });

        describe('positioning model', () => {
            let globalReferenceSpace: ReferenceSpace;
            let model: Model;
            let callbackNode: CallbackNode<DataFrame>; // Position manipulation

            /**
             * Create the positioning model
             */
            before((done) => {
                // Define the global reference space
                // (if not defined, created by default)
                globalReferenceSpace = new ReferenceSpace();

                // For testing, manipulate position
                callbackNode = new CallbackNode();

                ModelBuilder.create()
                    .withReferenceSpace(globalReferenceSpace)
                    .addShape(GraphBuilder.create()
                        .from()
                        .via(callbackNode)
                        .to(new CallbackSinkNode()))
                    .build().then((m: Model) => {
                        model = m;
                        // Create a test object
                        const object = new DataObject("test");
                        // Object is currently at a known location (2, 2, 1)
                        object.currentPosition = new Absolute3DPosition(2, 2, 1);

                        // Insert into the system
                        Promise.resolve(model.push(new DataFrame(object))).then(() => {
                            done();
                        });
                    });
            });

            it('should translate the origin offset', (done) => {
                // Calibrated reference space
                // In a normal situation, this offset/scale/rotation needs to be calculated
                let calibratedReferenceSpace = new ReferenceSpace()
                    .translation(2, 2, 1)            // Origin offset
                    .scale(1, 1, 1)                  // Same scale on all axis 1:1
                    .rotation(0, 0, 0);              // Same rotation

                // Test node that provides a location with a different reference space
                // e.g. WebXR providing a location (5,5,5) with a different origin
                callbackNode.pushCallback = (frame: DataFrame) => {
                    const object = frame.getObjectByUID("test");
                    object.setCurrentPosition(new Absolute3DPosition(5, 5, 5), calibratedReferenceSpace);
                };

                Promise.resolve(model.push(new DataFrame(new DataObject("test")))).then(() => {
                    return model.findDataService(DataObject).findByUID("test")
                }).then(storedObject => {
                    // This will return the current position relative to the 'calibratedReferenceSpace'
                    // Meaning the position will be (5, 5, 5)
                    const relativePosition = storedObject.getCurrentPosition(calibratedReferenceSpace) as Absolute3DPosition;
                    expect(relativePosition.x).to.equal(5);
                    expect(relativePosition.y).to.equal(5);
                    expect(relativePosition.z).to.equal(5);

                    // This will return the current position relative to the global reference space
                    // The origin of the relative 3d position (0, 0, 0) will translate
                    // to the absolute position (2, 2, 1)
                    // Meaning the position (5, 5, 5) will transform to (7, 7, 6)
                    const transformedPosition = storedObject.getCurrentPosition() as Absolute3DPosition;
                    expect(transformedPosition.x).to.equal(7);
                    expect(transformedPosition.y).to.equal(7);
                    expect(transformedPosition.z).to.equal(6);
                    done();
                }).catch(ex => {
                    done(ex);
                });
            });

        });

    });
});
