import { expect } from 'chai';
import 'mocha';
import { GeographicalPosition } from '../../../src';

describe('position', () => {

    describe('GeographicalPosition', () => {

        it('should calculate the midpoint', (done) => {
            const position = new GeographicalPosition(3, 3);
            position.midpoint(new GeographicalPosition(5, 5)).then(midpoint => {
                done();
            });
        });

        it('should trilaterate with three points', (done) => {
            const positions = [
                new GeographicalPosition(1, 1),
                new GeographicalPosition(3, 3),
                new GeographicalPosition(5, 5),
            ];
            const distances = [
                3,
                4,
                3
            ];
            
            GeographicalPosition.trilaterate(positions, distances).then(result => {
                done();
            });
        });


    });

});