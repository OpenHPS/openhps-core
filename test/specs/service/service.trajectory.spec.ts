import { DataObject, Absolute2DPosition, MemoryDataService, TrajectoryService, Absolute3DPosition } from '../../../src';
import { expect } from 'chai';
import 'mocha';

describe('trajectory', () => {
    describe('service', () => {
        let trajectoryService: TrajectoryService<Absolute3DPosition>;

        it('should store multiple positions of the same object', (done) => {
            trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
            const insertPromises = [];

            for (let i = 0; i < 10; i++) {
                const object = new DataObject('abc');
                const position = new Absolute2DPosition(i, i);
                position.timestamp = i;
                object.setPosition(position);
                insertPromises.push(trajectoryService.appendPosition(object));
            }

            Promise.all(insertPromises)
                .then(() => {
                    return trajectoryService.findAll();
                })
                .then((positions) => {
                    expect(positions.length).to.equal(10);
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should find the last known position', (done) => {
            trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
            const insertPromises = [];

            for (let i = 0; i < 10; i++) {
                const object = new DataObject('abc');
                const position = new Absolute2DPosition(i, i);
                position.timestamp = i;
                object.setPosition(position);
                insertPromises.push(trajectoryService.appendPosition(object));
            }

            Promise.all(insertPromises)
                .then(() => {
                    return trajectoryService.findPosition('abc');
                })
                .then((position) => {
                    expect(position.toVector3().toArray()).to.eql([9, 9, 0]);
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should find a trajectory', (done) => {
            trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
            const insertPromises = [];

            for (let i = 0; i < 10; i++) {
                const object = new DataObject('abc');
                const position = new Absolute2DPosition(i, i);
                position.timestamp = i;
                object.setPosition(position);
                insertPromises.push(trajectoryService.appendPosition(object));
            }

            Promise.all(insertPromises)
                .then(() => {
                    return trajectoryService.findTrajectory('abc');
                })
                .then((positions) => {
                    expect(positions.length).to.equal(10);
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should find a trajectory from start to end date or time', (done) => {
            trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
            const insertPromises = [];

            for (let i = 0; i < 10; i++) {
                const object = new DataObject('abc');
                const position = new Absolute2DPosition(i, i);
                position.timestamp = i;
                object.setPosition(position);
                insertPromises.push(trajectoryService.appendPosition(object));
            }

            Promise.all(insertPromises)
                .then(() => {
                    return trajectoryService.findTrajectory('abc', 2, 5);
                })
                .then((positions) => {
                    expect(positions.length).to.equal(2);
                    done();
                })
                .catch(done);
        });
    });
});
