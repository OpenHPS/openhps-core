import { expect } from 'chai';
import 'mocha';
import { Absolute2DPosition, DataSerializer, LinearVelocity, Velocity } from '../../../src';

describe('position', () => {
    describe('Absolute2DPosition', () => {
        it('should calculate the midpoint', () => {
            const position = new Absolute2DPosition(3, 3);
            const midpoint = position.midpoint(new Absolute2DPosition(5, 5));
            expect(midpoint.x).to.equal(4);
            expect(midpoint.y).to.equal(4);
        });
    });
});
