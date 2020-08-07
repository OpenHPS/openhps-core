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

        it('should trilaterate with three points', (done) => {
            const positions = [
                new Absolute2DPosition(1, 1),
                new Absolute2DPosition(3, 3),
                new Absolute2DPosition(5, 5),
            ];
            const distances = [
                1,
                1,
                1
            ];
            
            Absolute2DPosition.trilaterate(positions, distances).then(result => {
                done();
            });
        });

        it('should triangulate with three points', (done) => {
            const positions = [
                new Absolute2DPosition(1, 1),
                new Absolute2DPosition(3, 3),
                new Absolute2DPosition(5, 5),
            ];
            const angles = [
                3,
                4,
                3
            ];
            
            Absolute2DPosition.triangulate(positions, angles).then(result => {
                done();
            });
        });

    });

});