import 'mocha';
import { expect } from 'chai';
import { Quaternion } from '../../../src/data/position/Quaternion';
import { AngleUnit } from '../../../src';

describe('quaternion', () => {

    it('should be empty at creation', () => {
        const quat = new Quaternion();
        expect(quat.x).to.equal(0);
        expect(quat.y).to.equal(0);
        expect(quat.z).to.equal(0);
        expect(quat.w).to.equal(1);
        expect(Math.round(quat.toEulerVector(AngleUnit.DEGREES)[0])).to.equal(0);
        expect(Math.round(quat.toEulerVector(AngleUnit.DEGREES)[1])).to.equal(0);
        expect(Math.round(quat.toEulerVector(AngleUnit.DEGREES)[2])).to.equal(0);
    });

    it('should convert from euler X and back', () => {
        const euler = [90, 0, 0];
        const quat = Quaternion.fromEulerVector(euler, AngleUnit.DEGREES);
        expect(quat.x).to.equal(0.7071067811865475);
        expect(quat.y).to.equal(0);
        expect(quat.z).to.equal(0);
        expect(quat.w).to.equal(0.7071067811865476);
        expect(Math.round(quat.toEulerVector(AngleUnit.DEGREES)[0])).to.equal(90);
    });

    it('should convert from euler Y and back', () => {
        const euler = [0, 90, 0];
        const quat = Quaternion.fromEulerVector(euler, AngleUnit.DEGREES);
        expect(quat.x).to.equal(0);
        expect(quat.y).to.equal(0.7071067811865475);
        expect(quat.z).to.equal(0);
        expect(quat.w).to.equal(0.7071067811865476);
        expect(Math.round(quat.toEulerVector(AngleUnit.DEGREES)[1])).to.equal(90);
    });

    it('should convert from euler Z and back', () => {
        const euler = [0, 0, 90];
        const quat = Quaternion.fromEulerVector(euler, AngleUnit.DEGREES);
        expect(quat.x).to.equal(0);
        expect(quat.y).to.equal(0);
        expect(quat.z).to.equal(0.7071067811865475);
        expect(quat.w).to.equal(0.7071067811865476);
        expect(Math.round(quat.toEulerVector(AngleUnit.DEGREES)[2])).to.equal(90);
    });

});
