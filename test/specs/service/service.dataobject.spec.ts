import { Model, ModelBuilder, DataFrame, DataObjectService, DataObject, ServiceMergeNode, Cartesian2DPosition, Cartesian3DPosition } from '../../../src';
import { LoggingSinkNode } from '../../../src/nodes/sink';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';

import { expect } from 'chai';
import 'mocha';
import { MemoryDataObjectService } from '../../../src/service/MemoryDataObjectService';

describe('data object', () => {
    describe('service', () => {
        var objectDataService: DataObjectService<DataObject>;

        before((done) => {
            objectDataService = new MemoryDataObjectService(DataObject);
            var object1 = new DataObject();
            object1.currentPosition = new Cartesian2DPosition(5, 6);
            object1.displayName = "Test";

            var object2 = new DataObject();
            object2.currentPosition = new Cartesian3DPosition(5, 6, 2);
            object2.displayName = "Test";

            const insertPromises = new Array();
            insertPromises.push(objectDataService.insert(object1));
            insertPromises.push(objectDataService.insert(object2));
            
            Promise.all(insertPromises).then(() => {
                done();
            }).catch(ex => {
                done(ex);
            });
        });
        
        it('should find a object by 2d position', (done) => {
            objectDataService.findByCurrentPosition(new Cartesian2DPosition(5, 6)).then(objects => {
                expect(objects[0].currentPosition).to.be.instanceOf(Cartesian2DPosition);
                const location = objects[0].currentPosition as Cartesian2DPosition;
                expect(location.x).to.equal(5);
                expect(location.y).to.equal(6);
                expect(objects[0].displayName).to.equal("Test");
                done();
            }).catch(ex => {
                done(ex);
            });
        });

        it('should find a object by 3d position', (done) => {
            objectDataService.findByCurrentPosition(new Cartesian3DPosition(5, 6, 2)).then(objects => {
                expect(objects[0].currentPosition).to.be.instanceOf(Cartesian3DPosition);
                const location = objects[0].currentPosition as Cartesian3DPosition;
                expect(location.x).to.equal(5);
                expect(location.y).to.equal(6);
                expect(location.z).to.equal(2);
                expect(objects[0].displayName).to.equal("Test");
                done();
            }).catch(ex => {
                done(ex);
            });
        });

        it('should store objects', (done) => {
            var object = new DataObject("2");
            object.displayName = "Test";
            objectDataService.insert(object).then(savedObject => {
                expect(savedObject.uid).to.equal("2");
                expect(savedObject.displayName).to.equal("Test");
                objectDataService.findByUID("2").then(savedObject => {
                    expect(savedObject.uid).to.equal("2");
                    expect(savedObject.displayName).to.equal("Test");
                    done();
                });
            });
        });

        it('should throw an error when quering non existing objects', (done) => {
            objectDataService.findByUID("test").then(savedObject => {
                
            }).catch(ex => {
                done();
            });
        });

        it('should find all items', () => {
            objectDataService.findAll().then(objects => {
                expect(objects.length).to.be.gte(1);
            });
        });

    });
    describe('input layer', () => {
        var model: Model<DataFrame, DataFrame>;
        var objectDataService: DataObjectService<DataObject>;
        
        before((done) => {
            ModelBuilder.create()
                .from()
                .via(new ServiceMergeNode())
                .to(new LoggingSinkNode())
                .build().then(m => {
                    model = m;
                    objectDataService = model.findDataService(DataObject);

                    var object = new DummySensorObject("123");
                    object.currentPosition = new Cartesian2DPosition(3,2);
                    object.displayName = "Hello";
                    objectDataService.insert(object).then(savedObject => {
                        done();
                    });
                });
        });

        it('should load unknown objects', (done) => {
            var object = new DummySensorObject("123");
            var frame = new DataFrame();
            frame.addObject(object);
            model.push(frame).then(_ => {
                // Check if it is stored
                objectDataService.findAll().then(objects => {
                    expect(objects[0].displayName).to.equal("Hello");
                    done();
                }).catch(ex => {
                    done(ex);
                });
            }).catch(ex => {
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

    describe('output layer', () => {
        var model: Model<DataFrame, DataFrame>;
        var objectDataService: DataObjectService<DataObject>;
        
        before((done) => {
            ModelBuilder.create()
                .from()
                .to(new LoggingSinkNode())
                .build().then(m => {
                    model = m;
                    objectDataService = model.findDataService(DataObject); 
                    done();
                });
        });

        it('should store objects at the output layer', (done) => {
            var object = new DataObject();
            object.currentPosition = new Cartesian2DPosition(1,2);
            object.displayName = "Test";
            var frame = new DataFrame();
            frame.addObject(object);
            model.push(frame).then(_ => {
                // Check if it is stored
                objectDataService.findAll().then(objects => {
                    expect(objects[0].displayName).to.equal("Test");
                    expect(objects[0].currentPosition).to.be.instanceOf(Cartesian2DPosition);
                    expect(((objects[0].currentPosition) as Cartesian2DPosition).y).to.equal(2);
                    done();
                }).catch(ex => {
                    done(ex);
                });
            }).catch(ex => {
                done(ex);
            });
        });

        it('should store unknown data objects at the output layer', (done) => {
            var object = new DummySensorObject();
            object.displayName = "Testabc";
            var frame = new DataFrame();
            frame.addObject(object);
            model.push(frame).then(_ => {
                // Check if it is stored
                objectDataService.findAll().then(objects => {
                    expect(objects[1].displayName).to.equal("Testabc");
                    done();
                }).catch(ex => {
                    done(ex);
                });
            }).catch(ex => {
                done(ex);
            });
        });

    });
});