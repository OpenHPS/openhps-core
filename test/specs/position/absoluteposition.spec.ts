import { expect } from 'chai';
import 'mocha';
import {
    Absolute2DPosition,
    Accuracy2D,
    AngleUnit,
    AngularVelocity,
    DataObject,
    DataSerializer,
    LengthUnit,
    LinearVelocity,
    Orientation,
    ReferenceSpace,
} from '../../../src';

describe('AbsolutePosition', () => {
    describe('serialization', () => {
        it('should serialize a position indirectly', () => {
            const obj = new DataObject();
            obj.position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            const serialized = DataSerializer.serialize(obj);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(obj);
        });

        it('should serialize a position without orientation', () => {
            const position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            const serialized = DataSerializer.serialize(position);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(position);
        });

        it('should serialize a position with orientation', () => {
            const position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            position.orientation = Orientation.fromEuler({
                yaw: 0,
                pitch: 0,
                roll: 0,
                unit: AngleUnit.DEGREE,
            });
            const serialized = DataSerializer.serialize(position);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(position);
        });

        it('should serialize a position with orientation and accuracy', () => {
            const position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            position.orientation = Orientation.fromEuler({
                yaw: 0,
                pitch: 0,
                roll: 0,
                unit: AngleUnit.DEGREE,
            });
            position.accuracy = new Accuracy2D(10, 5, LengthUnit.METER);
            const serialized = DataSerializer.serialize(position);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(position);
        });

        it('should serialize a position with all components', () => {
            const position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            position.orientation = Orientation.fromEuler({
                yaw: 0,
                pitch: 0,
                roll: 0,
                unit: AngleUnit.DEGREE,
            });
            position.linearVelocity = new LinearVelocity(1, 2);
            position.angularVelocity = new AngularVelocity(5, 1, 2);
            position.accuracy = new Accuracy2D(10, 5, LengthUnit.METER);
            const serialized = DataSerializer.serialize(position);
            const deserialized: Absolute2DPosition = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(position);
        });
    });
});
