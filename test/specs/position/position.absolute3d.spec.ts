import { expect } from 'chai';
import 'mocha';
import { Absolute3DPosition } from '../../../src';

describe('position', () => {

    describe('Absolute3DPosition', () => {

        it('should calculate the midpoint', (done) => {
            const position = new Absolute3DPosition(3, 3, 3);
            position.midpoint(new Absolute3DPosition(5, 5, 5)).then(midpoint => {
                expect(midpoint.x).to.equal(4);
                expect(midpoint.y).to.equal(4);
                expect(midpoint.z).to.equal(4);
                done();
            });
        });

        it('should trilaterate with three points', (done) => {
            const positions = [
                new Absolute3DPosition(1, 1, 1),
                new Absolute3DPosition(3, 3, 3),
                new Absolute3DPosition(5, 5, 5),
            ];
            const distances = [
                3,
                4,
                3
            ];
            
            Absolute3DPosition.trilaterate(positions, distances).then(result => {
                done();
            });
        });

        it('should triangulate with three points', (done) => {
            const positions = [
                new Absolute3DPosition(1, 1, 1),
                new Absolute3DPosition(3, 3, 3),
                new Absolute3DPosition(5, 5, 5),
            ];
            const angles = [
                3,
                4,
                3
            ];
            
            Absolute3DPosition.triangulate(positions, angles).then(result => {
                done();
            });
        });

    });

});