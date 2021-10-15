import { expect } from 'chai';
import 'mocha';
import { Absolute2DPosition, Accuracy2D, AngleUnit, DataSerializer, LengthUnit, Orientation } from '../../../src';

describe('AbsolutePosition', () => {

    describe('serialization', () => {
        it('should serialize a position without orientation', () => {
            const position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            const serialized = DataSerializer.serialize(position);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(position);
        });

        it('should serialize a position with orientation', () => {
            const position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            position.orientation = Orientation.fromEuler({
                yaw: 0, pitch: 0, roll: 0, unit: AngleUnit.DEGREE
            });
            const serialized = DataSerializer.serialize(position);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(position);
        });

        it('should serialize a position with orientation and accuracy', () => {
            const position = new Absolute2DPosition(1, 2, LengthUnit.METER);
            position.orientation = Orientation.fromEuler({
                yaw: 0, pitch: 0, roll: 0, unit: AngleUnit.DEGREE
            });
            position.accuracy = new Accuracy2D(10, 5, LengthUnit.METER);
            const serialized = DataSerializer.serialize(position);
            const deserialized = DataSerializer.deserialize(serialized);
            console.log(serialized, deserialized)
            expect(deserialized).to.eql(position);
        });
    });
    
});
