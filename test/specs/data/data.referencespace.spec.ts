import { expect } from 'chai';
import 'mocha';
import { ReferenceSpace, AngleUnit, Model, ModelBuilder, GraphBuilder, CallbackNode, DataFrame, DataObject, Absolute3DPosition, SinkNode, CallbackSinkNode, CallbackSourceNode } from '../../../src';
import * as math from 'mathjs';

describe('data', () => {
    describe('reference space', () => {
        describe('translation', () => {

            it('should shift position', () => {
                let globalReferenceSpace = new ReferenceSpace(undefined);
    
                let refSpace = new ReferenceSpace(globalReferenceSpace)
                    .translation(2.0, 2.0, 2.0);
                let result = math.multiply([3, 3, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.equal(5);
                expect(result[1]).to.equal(5);
                expect(result[2]).to.equal(2);
            });

        });

        describe('scaling', () => {

            it('should scale up', () => {
                let globalReferenceSpace = new ReferenceSpace(undefined);
    
                let refSpace = new ReferenceSpace(globalReferenceSpace)
                    .scale(2.0, 2.0, 2.0);
                let result = math.multiply([3, 3, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.equal(6);
                expect(result[1]).to.equal(6);
                expect(result[2]).to.equal(0);
            });

            it('should scale down', () => {
                let globalReferenceSpace = new ReferenceSpace(undefined);
    
                let refSpace = new ReferenceSpace(globalReferenceSpace)
                    .scale(0.5, 0.5, 0.5);
                let result = math.multiply([3, 3, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.equal(1.5);
                expect(result[1]).to.equal(1.5);
                expect(result[2]).to.equal(0);
            });

        });

        describe('rotation', () => {

            it('should rotate on X axis', () => {
                let globalReferenceSpace = new ReferenceSpace(undefined);
    
                let refSpace = new ReferenceSpace(globalReferenceSpace)
                    .rotation(180, 0, 0, AngleUnit.DEGREES);
                let result = math.multiply([2, 2, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.within(-2.1, -1.9);
                expect(result[1]).to.within(-2.1, -1.9);
                expect(result[2]).to.equal(0);
            });

        });

        describe('positioning model', () => {
            let model: Model;
            let callbackNode: CallbackNode<DataFrame>; // Position manipulation

            /**
             * Create the positioning model
             */
            before((done) => {
                // For testing, manipulate position
                callbackNode = new CallbackNode();

                ModelBuilder.create()
                    .addShape(GraphBuilder.create()
                        .from(new CallbackSourceNode()) // Source node merges stored data objects
                        .via(callbackNode)              // Test node
                        .to(new CallbackSinkNode()))    // Sink node stores data objects
                    .build().then((m: Model) => {
                        model = m;
                        done();
                    });
            });

            /**
             * Reset the location of the object #test
             * for each test to (2, 2, 1)
             */
            beforeEach((done) => {
                // Reset test node
                callbackNode.pushCallback = (_) => { };

                // Create a test object
                const object = new DataObject("test");
                // Object is currently at a known location (2, 2, 1)
                object.setCurrentPosition(new Absolute3DPosition(2, 2, 1));

                // Insert into the system
                model.push(new DataFrame(object)).then(() => {
                    // Confirm that it is inserted
                    model.findDataService(DataObject).findByUID("test").then(storedObject => {
                        const storedLocation = storedObject.getCurrentPosition() as Absolute3DPosition;
                        expect(storedLocation.x).to.eq(2);
                        expect(storedLocation.y).to.eq(2);
                        expect(storedLocation.z).to.eq(1);
                        done();
                    });
                });
            });

            it('should translate the origin offset', (done) => {
                // Calibrated reference space
                // In a normal situation, this offset/scale/rotation needs to be calculated
                let calibratedReferenceSpace = new ReferenceSpace(model.referenceSpace)
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

            it('should inverse the orientation', (done) => {
                // Calibrated reference space
                // In a normal situation, this offset/scale/rotation needs to be calculated
                let calibratedReferenceSpace = new ReferenceSpace(model.referenceSpace)
                    .translation(2, 2, 1)            // Origin offset
                    .scale(1, 1, 1)                  // Same scale on all axis 1:1
                    .rotation(0, 180, 0, AngleUnit.DEGREES);          // Rotation is inverse (down is up, left is right)

                // Test node that provides a location with a different reference space
                // This example will move the object forward. However, in our global
                // reference space, forward is backwards
                callbackNode.pushCallback = (frame: DataFrame) => {
                    const object = frame.getObjectByUID("test");
                    // Get the current position using the reference space of this node
                    const currentPosition = object.getCurrentPosition(calibratedReferenceSpace) as Absolute3DPosition;
                    currentPosition.x += 1; // Move foward on the X axis (1, 0, 0)
                    // However, according to the global reference space we moved backwards (1, 2, 1)
                    object.setCurrentPosition(currentPosition, calibratedReferenceSpace);
                };

                Promise.resolve(model.push(new DataFrame(new DataObject("test")))).then(() => {
                    return model.findDataService(DataObject).findByUID("test")
                }).then(storedObject => {
                    // This will return the current position relative to the 'calibratedReferenceSpace'
                    // Meaning the position will be (1, 0, 0)
                    const relativePosition = storedObject.getCurrentPosition(calibratedReferenceSpace) as Absolute3DPosition;
                    expect(Math.round(relativePosition.x)).to.equal(1);
                    expect(Math.round(relativePosition.y)).to.equal(0);
                    expect(Math.round(relativePosition.z)).to.equal(0);

                    // This will return the current position relative to the global reference space
                    // The origin of the relative 3d position (0, 0, 0) will translate
                    // to the absolute position (2, 2, 1) and the rotation will also be taken into account
                    // Meaning the position (1, 0, 0) will transform to (1, 2, 1)
                    const transformedPosition = storedObject.getCurrentPosition() as Absolute3DPosition;
                    expect(Math.round(transformedPosition.x)).to.equal(1);
                    expect(Math.round(transformedPosition.y)).to.equal(2);
                    expect(Math.round(transformedPosition.z)).to.equal(1);
                    done();
                }).catch(ex => {
                    done(ex);
                });
            });

        });

    });
});
