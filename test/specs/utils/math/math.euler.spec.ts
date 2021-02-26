import 'mocha';
import { expect } from 'chai';
import { Euler, AngleUnit, Matrix4 } from '../../../../src';

describe('math', () => {
    describe('euler rotation', () => {
        describe('order XYZ', () => {
            it('should load from X', () => {
                const euler = new Euler(45, 0, 0, 'XYZ', AngleUnit.DEGREE);
                const rotationMatrix = euler.toRotationMatrix();
                expect(rotationMatrix).to.eql(
                    new Matrix4().fromArray([1,0,0,0,-0,0.7071067811865476,0.7071067811865475,0,0,-0.7071067811865475,0.7071067811865476,0,0,0,0,1])
                );
            });

            it('should load from Y', () => {
                const euler = new Euler(0, 45, 0, 'XYZ', AngleUnit.DEGREE);
                const rotationMatrix = euler.toRotationMatrix();
                expect(rotationMatrix).to.eql(
                    new Matrix4().fromArray([0.7071067811865476,0,-0.7071067811865475,0,-0,1,0,0,0.7071067811865475,-0,0.7071067811865476,0,0,0,0,1])
                );
            });

            it('should load from Z', () => {
                const euler = new Euler(0, 0, 45, 'XYZ', AngleUnit.DEGREE);
                const rotationMatrix = euler.toRotationMatrix();
                expect(rotationMatrix).to.eql(
                    new Matrix4().fromArray([
                        0.7071067811865476, 0.7071067811865475,
                                         0,                  0,
                       -0.7071067811865475, 0.7071067811865476,
                                         0,                  0,
                                         0,                 -0,
                                         1,                  0,
                                         0,                  0,
                                         0,                  1
                     ])
                );
            });
        });
    });
});
