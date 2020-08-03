import { expect } from 'chai';
import 'mocha';
import { GeographicalPosition, AngleUnit } from '../../../src';

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
                5
            ];
            
            GeographicalPosition.trilaterate(positions, distances).then(result => {
                done();
            });
        }).timeout(10000);

        it('should calculate the distance between two points', () => {
            const distance = new GeographicalPosition(1, 1).distance( new GeographicalPosition(4, 9));
        });

        
        it('should calculate the bearing between two points', () => {
            const bearing = new GeographicalPosition(1, 1).bearing(new GeographicalPosition(4, 9));
        });

        it('should calculate the destination from a point in a direction', () => {
            const destination = new GeographicalPosition(1, 1).destination(100, 20, AngleUnit.DEGREES);
        });

    });

});