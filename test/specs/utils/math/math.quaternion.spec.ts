import 'mocha';
import { expect } from 'chai';
import { Quaternion, AngleUnit, DataSerializer, AxisAngle, Euler, Matrix4 } from '../../../../src';

describe('quaternion', () => {
    describe('axis rotation', () => {
        it('convert from instance', () => {
            const axis = new AxisAngle(0, 1.6580628, 0.6981317);
            const orientation = Quaternion.fromAxisAngle(axis);
            expect(orientation.toRotationMatrix()).to.eql(
                Matrix4.fromArray([
                    [-0.22627121069853606, -0.3779924833727482, 0.8977321547782064, 0],
                    [0.3779924833727482, 0.8153379847539467, 0.4385722895157373, 0],
                    [-0.8977321547782064, 0.4385722895157373, -0.04160919545248265, 0],
                    [0, 0, 0, 1],
                ]),
            );
        });

        it('convert from object', () => {
            const orientation = Quaternion.fromAxisAngle({ x: 0, y: 1.6580628, z: 0.6981317 });
            expect(orientation.toRotationMatrix()).to.eql(
                Matrix4.fromArray([
                    [-0.22627121069853606, -0.3779924833727482, 0.8977321547782064, 0],
                    [0.3779924833727482, 0.8153379847539467, 0.4385722895157373, 0],
                    [-0.8977321547782064, 0.4385722895157373, -0.04160919545248265, 0],
                    [0, 0, 0, 1],
                ]),
            );
        });

        it('convert from array', () => {
            const orientation = Quaternion.fromAxisAngle([0, 1.6580628, 0.6981317]);
            expect(orientation.toRotationMatrix()).to.eql(
                Matrix4.fromArray([
                    [-0.22627121069853606, -0.3779924833727482, 0.8977321547782064, 0],
                    [0.3779924833727482, 0.8153379847539467, 0.4385722895157373, 0],
                    [-0.8977321547782064, 0.4385722895157373, -0.04160919545248265, 0],
                    [0, 0, 0, 1],
                ]),
            );
        });

        it('convert to axis angle', () => {
            const axis = new AxisAngle(0, 1.6580628, 0.6981317);
            const orientation = Quaternion.fromAxisAngle(axis);
            expect(DataSerializer.serialize(orientation.toAxisAngle())).to.eql(DataSerializer.serialize(axis));
        });
    });

    describe('euler rotation', () => {
        it('convert from instance', () => {
            const euler = new Euler(45, 90, 0, 'XYZ', AngleUnit.DEGREE);
            const orientation = Quaternion.fromEuler(euler);
            expect(Matrix4.round(orientation.toRotationMatrix(), 5)).to.eql(
                Matrix4.fromArray([
                    [0, 0, 1, 0],
                    [0.70711, 0.70711, -0, 0],
                    [-0.70711, 0.70711, 0, 0],
                    [0, 0, 0, 1],
                ]),
            );
            const toEuler = Euler.fromRotationMatrix(orientation.toRotationMatrix(), 'XYZ');
            expect(toEuler.toVector()).to.eql(euler.toVector());
        });

        it('convert from vector3', () => {
            const euler = new Euler(45, 90, 0, 'XYZ', AngleUnit.DEGREE);
            const orientation = Quaternion.fromEuler(euler.toVector3());
            expect(Matrix4.round(orientation.toRotationMatrix(), 5)).to.eql(
                Matrix4.fromArray([
                    [0, 0, 1, 0],
                    [0.70711, 0.70711, -0, 0],
                    [-0.70711, 0.70711, 0, 0],
                    [0, 0, 0, 1],
                ]),
            );
            const toEuler = Euler.fromRotationMatrix(orientation.toRotationMatrix(), 'XYZ');
            expect(toEuler.toVector()).to.eql(euler.toVector());
        });

        it('convert from xyz object', () => {
            const orientation = Quaternion.fromEuler({ x: 0.7853981633974483, y: 1.5707963267948966, z: 0 });
            expect(Matrix4.round(orientation.toRotationMatrix(), 5)).to.eql(
                Matrix4.fromArray([
                    [0, 0, 1, 0],
                    [0.70711, 0.70711, -0, 0],
                    [-0.70711, 0.70711, 0, 0],
                    [0, 0, 0, 1],
                ]),
            );
        });

        it('convert from number array', () => {
            const orientation = Quaternion.fromEuler([0.7853981633974483, 1.5707963267948966, 0]);
            expect(Matrix4.round(orientation.toRotationMatrix(), 5)).to.eql(
                Matrix4.fromArray([
                    [0, 0, 1, 0],
                    [0.70711, 0.70711, -0, 0],
                    [-0.70711, 0.70711, 0, 0],
                    [0, 0, 0, 1],
                ]),
            );
        });
    });
});
