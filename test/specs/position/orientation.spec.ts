import 'mocha';
import { expect } from 'chai';
import { Quaternion, Orientation, EulerRotation, AngleUnit, DataSerializer } from '../../../src';

describe('orientation', () => {

    describe('serializing', () => {
        
        it('should be serializable', () => {
            const quat = new Quaternion(0.3394366, 0.7165883, 0.0754304, 0.6046439);
            const orientation = Orientation.fromQuaternion(quat);
            const serialized = DataSerializer.serialize(orientation);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql([
                [ -0.03837707388209988, 0.39525552983443996, 0.9177691658380199, 0 ],
                [ 0.57768965477268, 0.75818609867256, -0.30237145504484, 0 ],
                [ -0.81535381178746, 0.51858162346212, -0.2574319942329, 0 ],
                [ 0, 0, 0, 1 ]
            ]);
        });

    });

    describe('quaternion', () => {

        it('convert from object', () => {
            const quat = new Quaternion(0.3394366, 0.7165883, 0.0754304, 0.6046439);
            const orientation = Orientation.fromQuaternion(quat);
            expect(orientation).to.eql([
                [ -0.03837707388209988, 0.39525552983443996, 0.9177691658380199, 0 ],
                [ 0.57768965477268, 0.75818609867256, -0.30237145504484, 0 ],
                [ -0.81535381178746, 0.51858162346212, -0.2574319942329, 0 ],
                [ 0, 0, 0, 1 ]
            ]);
        });

        it('convert from array', () => {
            const orientation = Orientation.fromQuaternion([0.3394366, 0.7165883, 0.0754304, 0.6046439]);
            expect(orientation).to.eql([
                [ -0.03837707388209988, 0.39525552983443996, 0.9177691658380199, 0 ],
                [ 0.57768965477268, 0.75818609867256, -0.30237145504484, 0 ],
                [ -0.81535381178746, 0.51858162346212, -0.2574319942329, 0 ],
                [ 0, 0, 0, 1 ]
            ]);
        });

        it('convert to quaternion', () => {
            const orientation = Orientation.fromQuaternion([0.3394366, 0.7165883, 0.0754304, 0.6046439]);
            expect(orientation.toQuaternion()).to.instanceOf(Quaternion);
        });

    });

    describe('euler rotation', () => {

        it('convert from object', () => {
            const euler = new EulerRotation(45, 90, 0, 'XYZ', AngleUnit.DEGREES);
            const orientation = Orientation.fromEulerRotation(euler);
            expect(orientation).to.eql([
                [ 6.123233995736766e-17, -0, 1, 0 ],
                [ 0.7071067811865475, 0.7071067811865476, -4.329780281177466e-17, 0 ],
                [ -0.7071067811865476, 0.7071067811865475, 4.329780281177467e-17, 0 ],
                [ 0, 0, 0, 1 ]
            ]);
        });

        it('convert from number array', () => {
            const orientation = Orientation.fromEulerRotation({ x: 0.7853981633974483, y: 1.5707963267948966, z: 0 });
            expect(orientation).to.eql([
                [ 6.123233995736766e-17, -0, 1, 0 ],
                [ 0.7071067811865475, 0.7071067811865476, -4.329780281177466e-17, 0 ],
                [ -0.7071067811865476, 0.7071067811865475, 4.329780281177467e-17, 0 ],
                [ 0, 0, 0, 1 ]
            ]);
        });

    });

});
