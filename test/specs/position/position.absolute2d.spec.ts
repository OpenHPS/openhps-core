import { expect } from 'chai';
import 'mocha';
import { Absolute2DPosition } from '../../../src';

describe('position', () => {

    describe('Absolute2DPosition', () => {

        it('should calculate the midpoint', (done) => {
            const position = new Absolute2DPosition(3, 3);
            position.midpoint(new Absolute2DPosition(5, 5)).then(midpoint => {
                expect(midpoint.x).to.equal(4);
                expect(midpoint.y).to.equal(4);
                done();
            });
        });

    });

});