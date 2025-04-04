import { DataObject, Absolute2DPosition, TrajectoryService, Trajectory, ModelBuilder, CallbackSinkNode, DataFrame, Model } from '../../../src';
import { expect } from 'chai';
import 'mocha';
import { SlowMemoryDataService } from '../../mock/services/SlowMemoryDataService';

describe('TrajectoryService', () => {
    let trajectoryService: TrajectoryService<Trajectory>;

    before((done) => {
        trajectoryService = new TrajectoryService(new SlowMemoryDataService(Trajectory));
        // Prepare
        trajectoryService.emitAsync("build").then(() => {
            trajectoryService.deleteAll().then(_ => {
                done();
            });
        }).catch(done);
    });
    
    after((done) => {
        trajectoryService.emitAsync("destroy").then(() => {
            done();
        });
    });

    it('should store multiple positions of the same object', (done) => {
        let insertPromise = Promise.resolve();

        for (let i = 0; i < 10; i++) {
            const object = new DataObject('abc');
            const position = new Absolute2DPosition(i, i);
            position.timestamp = i;
            object.setPosition(position);
            insertPromise = insertPromise.then(
                () =>
                    new Promise((next) => {
                        trajectoryService.appendPosition(object).then(() => next()).catch(done);
                    }),
            );
        }

        insertPromise
            .then(() => {
                return trajectoryService.findAll();
            })
            .then((trajectories) => {
                expect(trajectories.length).to.equal(1);
                done();
            })
            .catch(done);
    });

    it('should find the last known trajectory', (done) => {
        trajectoryService.findCurrentTrajectory('abc').then((trajectory) => {
            expect(trajectory.positions[trajectory.positions.length - 1].toVector3().toArray()).to.eql([9, 9, 0]);
            done();
        })
        .catch((ex) => {
            done(ex);
        });
    });

    it('should find a trajectory', (done) => {
        trajectoryService.findCurrentTrajectory('abc')
            .then((trajectory) => {
                expect(trajectory.positions.length).to.equal(10);
                done();
            })
            .catch((ex) => {
                done(ex);
            });
    });

    it('should find a trajectory from start to end date or time', (done) => {
        trajectoryService.findTrajectoryByRange('abc', 2, 5)
            .then((trajectory) => {
                expect(trajectory.positions.length).to.equal(10);
                done();
            })
            .catch(done);
    });

    it('should support a practical example with a sink and autobind=true', (done) => {
        // Create position model
        let model: Model;
        ModelBuilder.create()
            .addService(new TrajectoryService(new SlowMemoryDataService(Trajectory), {
                dataService: DataObject // If you want to store trajectory of BLEObject, use BLEObject
            }))
            .from()
            .to(new CallbackSinkNode(function(frame: DataFrame) {
                // The trajectory service will automatically store
                // the position when the object is stored in the DataObjectService
                // (i.e. when reaching a sink)

                // Downside: this can cause race conditions if frames are pushed too fast
                // check autobind=false with a custom sink for solving this issue
            }))
            .build().then(m => {
                model = m;
                let pushPromise = Promise.resolve();
                // Delete all data from previous tests
                pushPromise = pushPromise.then(
                    () =>
                        new Promise((next) => {
                            model.findDataService(Trajectory).deleteAll().then(next);
                        }),
                );

                // Test data to push
                for (let i = 0; i < 10; i++) {
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(i, i);
                    position.timestamp = i;
                    object.setPosition(position);
                    pushPromise = pushPromise.then(
                        () =>
                            new Promise((next) => {
                                const frame = new DataFrame(object);
                                model.push(frame);
                                model.onceCompleted(frame.uid).then(() => {
                                    setTimeout(() => {
                                        next();
                                    }, 500); // Avoid race conditions
                                });
                            }),
                    );
                }
                
                return pushPromise;
            }).then(() => {
                // Verify that trajectory is stored
                const service = model.findDataService(Trajectory);
                return service.findAll();
            }).then(trajectories => {
                expect(trajectories.length).to.equal(1);
                expect(trajectories[0].positions.length).to.equal(10);
                done();
            }).catch(done);
    });

    it('should support a practical example with a sink and autobind=false', (done) => {
        // Create position model
        let model: Model;
        ModelBuilder.create()
            .addService(new TrajectoryService(new SlowMemoryDataService(Trajectory), {
                dataService: DataObject, // If you want to store trajectory of BLEObject, use BLEObject
                autoBind: false // You manually have to "appendPosition" in a sink
            }))
            .from()
            .to(new CallbackSinkNode(function(frame: DataFrame) {
                // The trajectory service will not store automatically
            }))
            .build().then(m => {
                model = m;
                let pushPromise = Promise.resolve();
                // Delete all data from previous tests
                pushPromise = pushPromise.then(
                    () =>
                        new Promise((next) => {
                            model.findDataService(Trajectory).deleteAll().then(next);
                        }),
                );

                // Test data to push
                for (let i = 0; i < 10; i++) {
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(i, i);
                    position.timestamp = i;
                    object.setPosition(position);
                    pushPromise = pushPromise.then(
                        () =>
                            new Promise((next) => {
                                const frame = new DataFrame(object);
                                model.push(frame);
                                model.onceCompleted(frame.uid).then(() => next());
                            }),
                    );
                }

                return pushPromise;
            }).then(() => {
                // Verify that trajectory is NOT stored
                const service = model.findDataService(Trajectory);
                return service.findAll();
            }).then(trajectories => {
                expect(trajectories.length).to.equal(0);
                done();
            }).catch(done);
    });

    it('should support a practical example with a custom sink and autobind=false', (done) => {
        // Create position model
        let model: Model;
        ModelBuilder.create()
            .addService(new TrajectoryService(new SlowMemoryDataService(Trajectory), {
                autoBind: false,
                dataService: DataObject
            }))
            .from()
            .to(new CallbackSinkNode(function(frame: DataFrame) {
                return new Promise((resolve, reject) => {
                    // The trajectory service will not store automatically

                    const service: TrajectoryService = this.model.findDataService(Trajectory);
                    // Append the position (similar to autoBind=true)
                    // service.appendPosition(frame.source);

                    // Append the position with a custom UID for the trajectory
                    service.appendPosition(frame.source, frame.source.uid + "_movement").then(() => {
                        resolve();
                    }).catch(reject);
                });
            }))
            .build().then(m => {
                model = m;
                let pushPromise = Promise.resolve();
                // Delete all data from previous tests
                pushPromise = pushPromise.then(
                    () =>
                        new Promise((next) => {
                            model.findDataService(Trajectory).deleteAll().then(next);
                        }),
                );

                // Test data to push
                for (let i = 0; i < 10; i++) {
                    const object = new DataObject('abc');
                    const position = new Absolute2DPosition(i, i);
                    position.timestamp = i;
                    object.setPosition(position);
                    pushPromise = pushPromise.then(
                        () =>
                            new Promise((next) => {
                                const frame = new DataFrame(object);
                                model.push(frame);
                                model.onceCompleted(frame.uid).then(() => next());
                            }),
                    );
                }

                return pushPromise;
            }).then(() => {
                // Verify that trajectory is stored
                const service = model.findDataService(Trajectory);
                return service.findAll();
            }).then((trajectories: Trajectory[]) => {
                expect(trajectories.length).to.equal(1);
                expect(trajectories[0].positions.length).to.equal(10);
                expect(trajectories[0].uid).to.equal("abc_movement");
                done();
            }).catch(done);
    });
});
