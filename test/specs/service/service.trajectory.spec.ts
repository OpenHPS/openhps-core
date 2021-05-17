import { DataObject, Absolute2DPosition, MemoryDataService, TrajectoryService, Absolute3DPosition } from '../../../src';
import { expect } from 'chai';
import 'mocha';

describe('TrajectoryService', () => {
    let trajectoryService: TrajectoryService<Absolute3DPosition>;

    it('should store multiple positions of the same object', (done) => {
        trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
        let insertPromise = Promise.resolve();

        for (let i = 0; i < 10; i++) {
            const object = new DataObject('abc');
            const position = new Absolute2DPosition(i, i);
            position.timestamp = i;
            object.setPosition(position);
            insertPromise = insertPromise.then(() => new Promise((next) => {
                trajectoryService.appendPosition(object);
                next();
            }));
        }

        insertPromise
            .then(() => {
                return trajectoryService.findAll();
            })
            .then((trajectories) => {
                expect(trajectories.length).to.equal(1);
                done();
            })
            .catch((ex) => {
                done(ex);
            });
    });

    it('should find the last known trajectory', (done) => {
        trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
        let insertPromise = Promise.resolve();

        for (let i = 0; i < 10; i++) {
            const object = new DataObject('abc');
            const position = new Absolute2DPosition(i, i);
            position.timestamp = i;
            object.setPosition(position);
            insertPromise = insertPromise.then(() => new Promise((next) => {
                trajectoryService.appendPosition(object);
                next();
            }));
        }

        insertPromise
            .then(() => {
                return trajectoryService.findCurrentTrajectory('abc');
            })
            .then((trajectory) => {
                expect(trajectory.positions[trajectory.positions.length - 1].toVector3().toArray()).to.eql([9, 9, 0]);
                done();
            })
            .catch((ex) => {
                done(ex);
            });
    });

    it('should find a trajectory', (done) => {
        trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
        let insertPromise = Promise.resolve();

        for (let i = 0; i < 10; i++) {
            const object = new DataObject('abc');
            const position = new Absolute2DPosition(i, i);
            position.timestamp = i;
            object.setPosition(position);
            insertPromise = insertPromise.then(() => new Promise((next) => {
                trajectoryService.appendPosition(object);
                next();
            }));
        }

        insertPromise
            .then(() => {
                return trajectoryService.findCurrentTrajectory('abc');
            })
            .then((trajectory) => {
                expect(trajectory.positions.length).to.equal(10);
                done();
            })
            .catch((ex) => {
                done(ex);
            });
    });

    it('should find a trajectory from start to end date or time', (done) => {
        trajectoryService = new TrajectoryService(new MemoryDataService(Absolute3DPosition));
        let insertPromise = Promise.resolve();

        for (let i = 0; i < 10; i++) {
            const object = new DataObject('abc');
            const position = new Absolute2DPosition(i, i);
            position.timestamp = i;
            object.setPosition(position);
            insertPromise = insertPromise.then(() => new Promise((next) => {
                trajectoryService.appendPosition(object);
                next();
            }));
        }

        insertPromise
            .then(() => {
                return trajectoryService.findTrajectoryByRange('abc', 2, 5);
            })
            .then((trajectory) => {
                expect(trajectory.positions.length).to.equal(10);
                done();
            })
            .catch(done);
    });
});
