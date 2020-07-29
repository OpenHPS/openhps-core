import 'mocha';
import { expect } from 'chai';
import { Euler, AngleUnit } from '../../../../src';

describe('math', () => {
    describe('euler rotation', () => {

        describe('order XYZ', () => {

            it('should load from X', () => {
                const euler = new Euler(45, 0, 0, 'XYZ', AngleUnit.DEGREES);
                const rotationMatrix = euler.toRotationMatrix();
                expect(rotationMatrix).to.eql([
                    [ 1, 0, 0, 0 ],
                    [ 0, 0.7071067811865476, -0.7071067811865475, 0 ],
                    [ 0, 0.7071067811865475, 0.7071067811865476, 0 ],
                    [ 0, 0, 0, 1 ]
                ]);
            });

            it('should load from Y', () => {
                const euler = new Euler(0, 45, 0, 'XYZ', AngleUnit.DEGREES);
                const rotationMatrix = euler.toRotationMatrix();
                expect(rotationMatrix).to.eql([
                    [ 0.7071067811865476, 0, 0.7071067811865475, 0 ],
                    [ 0, 1, 0, 0 ],
                    [ -0.7071067811865475, 0, 0.7071067811865476, 0 ],
                    [ 0, 0, 0, 1 ]
                ]);
            });

            it('should load from Z', () => {
                const euler = new Euler(0, 0, 45, 'XYZ', AngleUnit.DEGREES);
                const rotationMatrix = euler.toRotationMatrix();
                expect(rotationMatrix).to.eql([
                    [ 0.7071067811865476, -0.7071067811865475, 0, 0 ],
                    [ 0.7071067811865475, 0.7071067811865476, 0, 0 ],
                    [ 0, 0, 1, 0 ],
                    [ 0, 0, 0, 1 ]
                ]);
            });

        });

    });
});
