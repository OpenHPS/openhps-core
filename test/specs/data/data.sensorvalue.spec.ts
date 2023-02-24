import { expect } from 'chai';
import 'mocha';
import { Acceleration, Orientation, SensorValue, Vector3 } from '../../../src';

describe('SensorValue', () => {

    describe('fromVector()', () => {
        it('should construct a sensor value based on a vector', () => {
            const accleration: Acceleration = Acceleration.fromVector(new Vector3(1, 2, 3));
            expect(accleration).to.be.instanceOf(Acceleration);
        });

    });
});
