import {
    LoggingSinkNode,
    CallbackSinkNode,
    Model,
    ModelBuilder,
    DataFrame,
    DataObjectService,
    DataObject,
    Absolute2DPosition,
    Absolute3DPosition,
    CallbackNode,
    CallbackSourceNode,
    MemoryDataService,
} from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';
import { expect } from 'chai';
import 'mocha';

describe('data object', () => {
    describe('service', () => {
        let objectDataService: DataObjectService<DataObject>;

        before((done) => {
            objectDataService = new DataObjectService(new MemoryDataService(DataObject));
            const object1 = new DataObject();
            object1.setPosition(new Absolute2DPosition(5, 6));
            object1.displayName = 'Test';
            object1.createdTimestamp = Date.parse('10 Mar 1995 00:00:00 GMT');

            const object2 = new DataObject();
            object2.setPosition(new Absolute3DPosition(5, 6, 2));
            object2.displayName = 'Test';
            object2.parentUID = object1.uid;
            object2.createdTimestamp = Date.parse('10 Mar 1995 01:00:00 GMT');

            const object3 = new DataObject();
            object3.setPosition(new Absolute3DPosition(1, 1, 2));
            object3.displayName = 'Maxim';
            object3.createdTimestamp = Date.parse('10 Mar 1995 02:00:00 GMT');

            const insertPromises = [];
            insertPromises.push(objectDataService.insert(object1.uid, object1));
            insertPromises.push(objectDataService.insert(object2.uid, object2));
            insertPromises.push(objectDataService.insert(object3.uid, object3));

            Promise.all(insertPromises)
                .then(() => {
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should support sorting in descending order', (done) => {
            objectDataService
                .findAll({}, {
                    sort: [['createdTimestamp', -1]]
                })
                .then((objects) => {
                    expect(objects.length).to.equal(3);
                    expect(objects[0].createdTimestamp).to.equal(794793600000);
                    expect(objects[objects.length - 1].createdTimestamp).to.equal(794800800000);
                    done();
                })
                .catch((ex) => {
                    done(ex);
            });
        });

        it('should support sorting in ascending order', (done) => {
            objectDataService
                .findAll({}, {
                    sort: [['createdTimestamp', 1]]
                })
                .then((objects) => {
                    expect(objects.length).to.equal(3);
                    expect(objects[0].createdTimestamp).to.equal(794800800000);
                    expect(objects[objects.length - 1].createdTimestamp).to.equal(794793600000);
                    done();
                })
                .catch((ex) => {
                    done(ex);
            });
        });

        it('should find data objects before a certain date', (done) => {
            objectDataService
                .findBefore(Date.parse('10 Mar 1995 01:30:00 GMT'))
                .then((objects) => {
                    expect(objects.length).to.equal(2);
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should find data objects after a certain date', (done) => {
            objectDataService
                .findAfter(Date.parse('10 Mar 1995 01:30:00 GMT'))
                .then((objects) => {
                    expect(objects.length).to.equal(1);
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should find a object by 2d position', (done) => {
            objectDataService
                .findByPosition(new Absolute2DPosition(5, 6))
                .then((objects) => {
                    expect(objects[0].getPosition()).to.be.instanceOf(Absolute2DPosition);
                    const location = objects[0].getPosition() as Absolute2DPosition;
                    expect(location.x).to.equal(5);
                    expect(location.y).to.equal(6);
                    expect(objects[0].displayName).to.equal('Test');
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should find a object by 3d position', (done) => {
            objectDataService
                .findByPosition(new Absolute3DPosition(5, 6, 2))
                .then((objects) => {
                    expect(objects[0].getPosition()).to.be.instanceOf(Absolute3DPosition);
                    const location = objects[0].getPosition() as Absolute3DPosition;
                    expect(location.x).to.equal(5);
                    expect(location.y).to.equal(6);
                    expect(location.z).to.equal(2);
                    expect(objects[0].displayName).to.equal('Test');
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should store objects', (done) => {
            const object = new DataObject('2');
            object.displayName = 'Test';
            objectDataService.insert(object.uid, object).then((savedObject) => {
                expect(savedObject.uid).to.equal('2');
                expect(savedObject.displayName).to.equal('Test');
                objectDataService.findByUID('2').then((savedObject) => {
                    expect(savedObject.uid).to.equal('2');
                    expect(savedObject.displayName).to.equal('Test');
                    done();
                });
            });
        });

        it('should throw an error when quering non existing objects', (done) => {
            objectDataService
                .findByUID('test')
                .then((savedObject) => {
                    done('It did not throw an error');
                })
                .catch((ex) => {
                    done();
                });
        });

        it('should find all items', () => {
            objectDataService.findAll().then((objects) => {
                expect(objects.length).to.be.gte(1);
            });
        });

        it('should find by display name', () => {
            objectDataService.findByDisplayName('Test').then((objects) => {
                expect(objects.length).to.equal(3);
            });
        });
    });
    describe('input layer', () => {
        let model: Model<DataFrame, DataFrame>;
        let objectDataService: DataObjectService<DataObject>;

        before((done) => {
            ModelBuilder.create()
                .from(new CallbackSourceNode())
                .to(new LoggingSinkNode())
                .build()
                .then((m) => {
                    model = m;
                    objectDataService = model.findDataService(DataObject);

                    const object = new DummySensorObject('123');
                    object.setPosition(new Absolute2DPosition(3, 2));
                    object.displayName = 'Hello';
                    objectDataService.insert(object.uid, object).then((savedObject) => {
                        done();
                    });
                });
        });

        it('should load unknown objects', (done) => {
            const object = new DummySensorObject('123');
            const frame = new DataFrame();
            frame.addObject(object);
            model
                .push(frame)
                .then((_) => {
                    // Check if it is stored
                    objectDataService
                        .findAll()
                        .then((objects) => {
                            expect(objects[0].displayName).to.equal('Hello');
                            done();
                        })
                        .catch((ex) => {
                            done(ex);
                        });
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should emit events', (done) => {
            objectDataService.once('deleteAll', () => {
                done();
            });
            Promise.resolve(objectDataService.deleteAll());
        });

        it('should delete all objects', (done) => {
            objectDataService.deleteAll().then(() => {
                done();
            });
        });
    });

    describe('output node', () => {
        let model: Model<DataFrame, DataFrame>;
        let objectDataService: DataObjectService<DataObject>;

        before((done) => {
            ModelBuilder.create()
                .from()
                .to(new LoggingSinkNode())
                .build()
                .then((m) => {
                    model = m;
                    objectDataService = model.findDataService(DataObject);
                    done();
                });
        });

        it('should store objects at the output layer', (done) => {
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(1, 2));
            object.displayName = 'Test';
            const frame = new DataFrame();
            frame.addObject(object);
            model
                .push(frame)
                .then((_) => {
                    // Check if it is stored
                    objectDataService
                        .findAll()
                        .then((objects) => {
                            expect(objects[0].displayName).to.equal('Test');
                            expect(objects[0].getPosition()).to.be.instanceOf(Absolute2DPosition);
                            expect((objects[0].getPosition() as Absolute2DPosition).y).to.equal(2);
                            done();
                        })
                        .catch((ex) => {
                            done(ex);
                        });
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should store unknown data objects at the output layer', (done) => {
            const object = new DummySensorObject();
            object.displayName = 'Testabc';
            const frame = new DataFrame();
            frame.addObject(object);
            model
                .push(frame)
                .then((_) => {
                    // Check if it is stored
                    objectDataService
                        .findAll()
                        .then((objects) => {
                            expect(objects[1].displayName).to.equal('Testabc');
                            done();
                        })
                        .catch((ex) => {
                            done(ex);
                        });
                })
                .catch((ex) => {
                    done(ex);
                });
        });

        it('should resolve the promise after stored', async () => {
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(1, 2));
            object.displayName = 'Test';
            const frame = new DataFrame();
            frame.addObject(object);
            const model: Model = await ModelBuilder.create()
                .from()
                .via(new CallbackNode())
                .to(new CallbackSinkNode())
                .build();
            await model.push(frame);
            const result = await model.findDataService(DataObject).findByUID(object.uid);
            expect(result.displayName).to.equal('Test');
        });
    });

    
    describe('output node without persistence', () => {
        let model: Model<DataFrame, DataFrame>;
        let objectDataService: DataObjectService<DataObject>;

        before((done) => {
            ModelBuilder.create()
                .from()
                .to(new CallbackSinkNode(() => {}, {
                    persistence: false
                }))
                .build()
                .then((m) => {
                    model = m;
                    objectDataService = model.findDataService(DataObject);
                    done();
                });
        });

        it('should not store objects at the output layer', (done) => {
            const object = new DataObject();
            object.setPosition(new Absolute2DPosition(1, 2));
            object.displayName = 'Test';
            const frame = new DataFrame();
            frame.addObject(object);
            model
                .push(frame)
                .then(() => {
                    // Check if it is stored
                    objectDataService
                        .findAll()
                        .then((objects) => {
                            expect(objects.length).to.equal(0);
                            done();
                        })
                        .catch((ex) => {
                            done(ex);
                        });
                })
                .catch((ex) => {
                    done(ex);
                });
        });
    });
});
