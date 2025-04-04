import { expect } from 'chai';
import 'mocha';
import {
    ReferenceSpace,
    AngleUnit,
    Model,
    ModelBuilder,
    GraphBuilder,
    CallbackNode,
    DataFrame,
    DataObject,
    Absolute3DPosition,
    CallbackSinkNode,
    CallbackSourceNode,
    LinearVelocity,
    Quaternion,
    Euler,
    DataObjectService,
    MemoryDataService,
    Orientation,
    Absolute2DPosition,
} from '../../../src';
import { Vector3 } from '../../../src/utils/math/_internal';

describe('data', () => {
    describe('reference space', () => {
        it('should be able to retrieve a transformation matrix', () => {
            const space = new ReferenceSpace();
            expect(space.transformationMatrix).to.not.be.undefined;
        });

        describe('translation', () => {
            it('should shift position', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).translation(2.0, 2.0, 2.0);
                const result = refSpace.transform(new Absolute3DPosition(3, 3)) as Absolute3DPosition;
                expect(result.x).to.equal(5);
                expect(result.y).to.equal(5);
                expect(result.z).to.equal(2);
            });

            it('should translate with a 2d position', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).translation(2.0, 2.0, 2.0);
                const result = refSpace.transform(new Absolute2DPosition(3, 3)) as Absolute3DPosition;
                expect(result.x).to.equal(5);
                expect(result.y).to.equal(5);
            });
        });

        describe('scaling', () => {
            it('should scale up', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).scale(2.0, 2.0, 2.0);
                const result = refSpace.transform(new Absolute3DPosition(3, 3)) as Absolute3DPosition;
                expect(result.x).to.equal(6);
                expect(result.y).to.equal(6);
                expect(result.z).to.equal(0);
            });

            it('should scale down', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).scale(0.5, 0.5, 0.5);
                const result = refSpace.transform(new Absolute3DPosition(3, 3)) as Absolute3DPosition;
                expect(result.x).to.equal(1.5);
                expect(result.y).to.equal(1.5);
                expect(result.z).to.equal(0);
            });

            it('should scale linear velocity', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).scale(0.5, 0.5, 0.5);
                const position = new Absolute3DPosition(3, 3);
                position.linearVelocity = new LinearVelocity(5, 0, 0);
                const result = refSpace.transform(position) as Absolute3DPosition;
                expect(result.x).to.equal(1.5);
                expect(result.y).to.equal(1.5);
                expect(result.z).to.equal(0);
                expect(result.linearVelocity.x).to.equal(2.5);
                expect(result.linearVelocity.y).to.equal(0);
            });
        });

        describe('rotation', () => {
            it('should rotate on X axis', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).rotation({
                    yaw: 180,
                    pitch: 0,
                    roll: 0,
                    unit: AngleUnit.DEGREE,
                });
                const result = refSpace.transform(new Absolute3DPosition(2, 2)) as Absolute3DPosition;
                expect(result.x).to.within(-2.1, -1.9);
                expect(result.y).to.within(-2.1, -1.9);
                expect(result.z).to.equal(0);
            });

            it('should rotate the orientation from 0 (yaw)', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).rotation({
                    yaw: 180,
                    pitch: 0,
                    roll: 0,
                    unit: AngleUnit.DEGREE,
                });
                const position = new Absolute3DPosition(0, 0);
                position.orientation = Orientation.fromEuler({ yaw: 0, pitch: 0, roll: 0, unit: AngleUnit.DEGREE });
                const result = refSpace.transform(position) as Absolute3DPosition;
                expect(result.orientation.toEuler().toVector(AngleUnit.DEGREE).z).to.equal(180);
            });

            it('should rotate the orientation from 90 (yaw)', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).rotation({
                    yaw: 180,
                    pitch: 0,
                    roll: 0,
                    unit: AngleUnit.DEGREE,
                });
                const position = new Absolute3DPosition(0, 0);
                position.orientation = Orientation.fromEuler({ yaw: 90, pitch: 0, roll: 0, unit: AngleUnit.DEGREE });
                const result = refSpace.transform(position) as Absolute3DPosition;
                expect(Math.round(result.orientation.toEuler().toVector(AngleUnit.DEGREE).z)).to.equal(-90);
            });

            it('should rotate the orientation (roll)', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);

                const refSpace = new ReferenceSpace(globalReferenceSpace).rotation(
                    new Euler(180, 0, 0, 'ZXY', AngleUnit.DEGREE),
                );
                const position = new Absolute3DPosition(0, 0);
                position.orientation = new Orientation(0, 0, 0, 1);
                const result = refSpace.transform(position) as Absolute3DPosition;
                // 180 degree rotation around the X axis should not modify Z
                expect(result.orientation.toEuler().toVector(AngleUnit.DEGREE).z).to.equal(0);
            });

            it('should transform a perspective', () => {
                const globalReferenceSpace = new ReferenceSpace(undefined);
                //  Corners of square
                const corners = [
                    new Absolute3DPosition(-3, -3), // Bottom-left
                    new Absolute3DPosition(-2, 2), // Top-left
                    new Absolute3DPosition(3, -3), // Bottom-right
                    new Absolute3DPosition(2, 2), // Top-right
                ];

                const refSpace = new ReferenceSpace(globalReferenceSpace).perspective(-0.5, 0.5, -0.5, 0.5, 2.0, 10.0);
                corners.forEach((corner) => {
                    const result = refSpace.transform(corner, {
                        inverse: true,
                    }) as Absolute3DPosition;
                });
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
                    .addShape(
                        GraphBuilder.create()
                            .from(new CallbackSourceNode()) // Source node merges stored data objects
                            .via(callbackNode) // Test node
                            .to(new CallbackSinkNode()),
                    ) // Sink node stores data objects
                    .build()
                    .then((m: Model) => {
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
                callbackNode.pushCallback = (_) => {};

                // Create a test object
                const object = new DataObject('test');
                // Object is currently at a known location (2, 2, 1)
                object.setPosition(new Absolute3DPosition(2, 2, 1));

                // Insert into the system
                model.push(new DataFrame(object));

                model.once('completed', () => {
                    model
                        .findDataService(DataObject)
                        .findByUID('test')
                        .then((obj) => {
                            // Confirm that it is inserted
                            const storedLocation = obj.getPosition() as Absolute3DPosition;
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
                const calibratedReferenceSpace = new ReferenceSpace(model.referenceSpace)
                    .translation(2, 2, 1) // Origin offset
                    .scale(1, 1, 1) // Same scale on all axis 1:1
                    .rotation({ x: 0, y: 0, z: 0 }); // Same rotation

                // Test node that provides a location with a different reference space
                // e.g. WebXR providing a location (5,5,5) with a different origin
                callbackNode.pushCallback = (frame: DataFrame) => {
                    const object = frame.getObjectByUID('test');
                    object.setPosition(new Absolute3DPosition(5, 5, 5), calibratedReferenceSpace);
                };

                Promise.resolve(model.findDataService(DataObject).findByUID('test'))
                    .then((obj) => {
                        const frame = new DataFrame(obj);
                        model.push(frame);
                        return model.onceCompleted(frame.uid);
                    })
                    .then(() => {
                        return model.findDataService(DataObject).findByUID('test');
                    })
                    .then((storedObject) => {
                        // This will return the current position relative to the 'calibratedReferenceSpace'
                        // Meaning the position will be (5, 5, 5)
                        const relativePosition = storedObject.getPosition(
                            calibratedReferenceSpace,
                        ) as Absolute3DPosition;
                        expect(relativePosition.x).to.equal(5);
                        expect(relativePosition.y).to.equal(5);
                        expect(relativePosition.z).to.equal(5);

                        // This will return the current position relative to the global reference space
                        // The origin of the relative 3d position (0, 0, 0) will translate
                        // to the absolute position (2, 2, 1)
                        // Meaning the position (5, 5, 5) will transform to (7, 7, 6)
                        const transformedPosition = storedObject.getPosition() as Absolute3DPosition;
                        expect(transformedPosition.x).to.equal(7);
                        expect(transformedPosition.y).to.equal(7);
                        expect(transformedPosition.z).to.equal(6);
                        done();
                    })
                    .catch((ex) => {
                        done(ex);
                    });
            });

            it('should inverse the orientation', (done) => {
                // Calibrated reference space
                // In a normal situation, this offset/scale/rotation needs to be calculated
                const calibratedReferenceSpace = new ReferenceSpace(model.referenceSpace)
                    .translation(2, 2, 1) // Origin offset
                    .scale(1, 1, 1) // Same scale on all axis 1:1
                    .rotation({ x: 0, y: 180, z: 0, unit: AngleUnit.DEGREE }); // Rotation is inverse (down is up, left is right)

                // Test node that provides a location with a different reference space
                // This example will move the object forward. However, in our global
                // reference space, forward is backwards
                callbackNode.pushCallback = (frame: DataFrame) => {
                    const object = frame.getObjectByUID('test');
                    // Get the current position using the reference space of this node
                    const currentPosition = object.getPosition(calibratedReferenceSpace) as Absolute3DPosition;
                    currentPosition.x += 1; // Move foward on the X axis (1, 0, 0)
                    // However, according to the global reference space we moved backwards (1, 2, 1)
                    object.setPosition(currentPosition, calibratedReferenceSpace);
                };

                Promise.resolve(model.findDataService(DataObject).findByUID('test'))
                    .then((obj) => {
                        expect(obj.getPosition(calibratedReferenceSpace).toVector3()).to.deep.equal(
                            new Vector3(0, 0, 0),
                        );
                        const frame = new DataFrame(obj);
                        model.push(frame);
                        return model.onceCompleted(frame.uid);
                    })
                    .then(() => {
                        return model.findDataService(DataObject).findByUID('test');
                    })
                    .then((storedObject) => {
                        // This will return the current position relative to the 'calibratedReferenceSpace'
                        // Meaning the position will be (1, 0, 0)
                        const relativePosition = storedObject.getPosition(
                            calibratedReferenceSpace,
                        ) as Absolute3DPosition;
                        expect(Math.round(relativePosition.x)).to.equal(1);
                        expect(Math.round(relativePosition.y)).to.equal(0);
                        expect(Math.round(relativePosition.z)).to.equal(0);

                        // This will return the current position relative to the global reference space
                        // The origin of the relative 3d position (0, 0, 0) will translate
                        // to the absolute position (2, 2, 1) and the rotation will also be taken into account
                        // Meaning the position (1, 0, 0) will transform to (1, 2, 1)
                        const transformedPosition = storedObject.getPosition() as Absolute3DPosition;
                        expect(Math.round(transformedPosition.x)).to.equal(1);
                        expect(Math.round(transformedPosition.y)).to.equal(2);
                        expect(Math.round(transformedPosition.z)).to.equal(1);
                        done();
                    })
                    .catch((ex) => {
                        done(ex);
                    });
            });
        });

        describe('conversion', () => {
            it('should convert translation to the first parent', async () => {
                const service = new DataObjectService(new MemoryDataService(ReferenceSpace, {
                    keepChangelog: false
                }));
                let ref1 = new ReferenceSpace();
                ref1 = await service.insertObject(ref1);
                let ref2 = new ReferenceSpace(ref1);
                ref2.translation(5, 5);
                ref2 = await service.insertObject(ref2);
                const storedRef2 = await service.findByUID(ref2.uid);
                expect(storedRef2.transformationMatrix).to.deep.equal(ref2.transformationMatrix);
                let ref3 = new ReferenceSpace(ref2);
                ref3.translation(2, 2);
                ref3 = await service.insertObject(ref3);
                const position = ref3.transform(new Absolute3DPosition(0, 0, 0));
                expect(position.x).to.equal(7);
                expect(position.y).to.equal(7);
                expect(position.z).to.equal(0);
            });

            it('should support changes to the parent reference space', async () => {
                const service = new DataObjectService(new MemoryDataService(ReferenceSpace));
                let ref1 = new ReferenceSpace();
                ref1 = await service.insertObject(ref1);
                let ref2 = new ReferenceSpace(ref1);
                ref2.translation(5, 5);
                ref2 = await service.insertObject(ref2);
                let ref3 = new ReferenceSpace(ref2);
                ref3.translation(2, 2);
                ref3 = await service.insertObject(ref3);
                let position = ref3.transform(new Absolute3DPosition(0, 0, 0));
                expect(position.x).to.equal(7);
                expect(position.y).to.equal(7);
                expect(position.z).to.equal(0);
                ref1.translation(3, 3);
                ref1 = await service.insertObject(ref1);
                position = ref3.transform(new Absolute3DPosition(0, 0, 0));
                expect(position.x).to.equal(10);
                expect(position.y).to.equal(10);
                expect(position.z).to.equal(0);
            });

            it('should support changes to the parent reference space with pass by reference', async () => {
                const service = new DataObjectService(new MemoryDataService(ReferenceSpace));
                let ref1 = new ReferenceSpace();
                ref1 = await service.insertObject(ref1);
                let ref2 = new ReferenceSpace(ref1);
                ref2.translation(5, 5);
                ref2 = await service.insertObject(ref2);
                let ref3 = new ReferenceSpace(ref2);
                ref3.translation(2, 2);
                ref3 = await service.insertObject(ref3);
                let position = ref3.transform(new Absolute3DPosition(0, 0, 0));
                expect(position.x).to.equal(7);
                expect(position.y).to.equal(7);
                expect(position.z).to.equal(0);
                let loadedRef = (await service.findByUID(ref1.uid)) as ReferenceSpace;
                loadedRef.translation(3, 3);
                loadedRef = await service.insertObject(loadedRef);
                await ref3.update(service);
                position = ref3.transform(new Absolute3DPosition(0, 0, 0));
                expect(position.x).to.equal(10);
                expect(position.y).to.equal(10);
                expect(position.z).to.equal(0);
            });
        });
    });
});
