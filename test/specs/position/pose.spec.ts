import { expect } from 'chai';
import 'mocha';
import { Absolute3DPosition, AngleUnit, DataSerializer, Orientation, Pose } from '../../../src';

describe('Pose', () => {
    it('should be created from a position and orientation', () => {
        const position = new Absolute3DPosition(10, 20, 5);
        const orientation = Orientation.fromEuler({
            yaw: 50, pitch: 20, roll: 10, unit: AngleUnit.DEGREE
        });
        const pose = Pose.fromPosition(position, orientation);
        expect(pose.position).to.eql(position);
        expect(pose.orientation.toEuler().toVector(AngleUnit.DEGREE).round()).to.eql(orientation.toEuler().toVector(AngleUnit.DEGREE).round());
    });

    it('should be serializable', () => {
        const position = new Absolute3DPosition(10, 20, 5);
        const orientation = Orientation.fromEuler({
            yaw: 50, pitch: 20, roll: 10, unit: AngleUnit.DEGREE
        });
        const pose = Pose.fromPosition(position, orientation);
        expect(pose).to.be.instanceof(Pose);
        const serialized = DataSerializer.serialize(pose);
        expect(serialized.__type).to.eq("Pose");
        const deserialized = DataSerializer.deserialize(serialized);
        expect(deserialized).to.be.instanceof(Pose);
    });

});
