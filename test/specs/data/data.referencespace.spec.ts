import { expect } from 'chai';
import 'mocha';
import { ReferenceSpace, AngleUnit, Model, ModelBuilder, GraphBuilder, CallbackNode, DataFrame, DataObject, Absolute3DPosition, RelativePosition, Relative3DPosition } from '../../../src';
import * as math from 'mathjs';

describe('data', () => {
    describe('reference space', () => {
        describe('translation', () => {

            it('should shift position', () => {
                let globalReferenceSpace = new ReferenceSpace();
    
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
                let globalReferenceSpace = new ReferenceSpace();
    
                let refSpace = new ReferenceSpace(globalReferenceSpace)
                    .scale(2.0, 2.0, 2.0);
                let result = math.multiply([3, 3, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.equal(6);
                expect(result[1]).to.equal(6);
                expect(result[2]).to.equal(0);
            });

            it('should scale down', () => {
                let globalReferenceSpace = new ReferenceSpace();
    
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
                let globalReferenceSpace = new ReferenceSpace();
    
                let refSpace = new ReferenceSpace(globalReferenceSpace)
                    .rotation(180, 0, 0, AngleUnit.DEGREES);
                let result = math.multiply([2, 2, 0, 1], refSpace.transformationMatrix);
                expect(result[0]).to.within(-2.1, -1.9);
                expect(result[1]).to.within(-2.1, -1.9);
                expect(result[2]).to.equal(0);
            });

        });

        describe('handling', () => {
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
                        .to())
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
                let calibratedReferenceSpace = new ReferenceSpace(globalReferenceSpace)
                    .scale(1.0, 1.0, 1.0)               // Scale is the same
                    .translation(-2.0, -2.0, -1.0)      // Origin offset
                    .rotation(0, 0, 0, AngleUnit.RADIANS);

                callbackNode.pushCallback = (frame: DataFrame) => {
                    const object = frame.getObjectByUID("test");
                    object.addRelativePosition(new Relative3DPosition(calibratedReferenceSpace, 5, 5, 5));
                };

                Promise.resolve(new DataFrame(new DataObject("test"))).then(() => {
                    model.findDataService(DataObject).findByUID("test").then(storedObject => {
                        const relativePosition = storedObject.getRelativePosition(calibratedReferenceSpace.uid) as Relative3DPosition;
                        expect(relativePosition.x).to.equal(5);
                        expect(relativePosition.y).to.equal(5);
                        expect(relativePosition.z).to.equal(5);

                        // The origin of the relative 3d position (0, 0, 0) will translate
                        // to the absolute position (2, 2, 1)
                        // Meaning the position (5, 5, 5) will transform to (7, 7, 6)
                        const transformedPosition = relativePosition.transform;
                        expect(transformedPosition.x).to.equal(7);
                        expect(transformedPosition.y).to.equal(7);
                        expect(transformedPosition.z).to.equal(6);
                    });
                });
            });

        });

    });
});
