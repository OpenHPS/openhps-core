import { Model, ModelBuilder, DataFrame, ObjectDataService, DataObject, SensorObject, ServiceMergeNode } from '../../src';
import { LoggingSinkNode } from '../../src/nodes/sink';

import { expect } from 'chai';
import 'mocha';

describe('data object', () => {
    describe('service', () => {
        var objectDataService: ObjectDataService;

        before((done) => {
            objectDataService = new ObjectDataService();
            var object = new DataObject(null);
            object.setDisplayName("Test");
            objectDataService.create(object).then(savedObject => {
                done();
            });
        });
        
        it('should store objects', (done) => {
            var object = new DataObject("2");
            object.setDisplayName("Test");
            objectDataService.create(object).then(savedObject => {
                expect(savedObject.getUID()).to.equal("2");
                expect(savedObject.getDisplayName()).to.equal("Test");
                objectDataService.findById("2").then(savedObject => {
                    expect(savedObject.getUID()).to.equal("2");
                    expect(savedObject.getDisplayName()).to.equal("Test");
                    done();
                });
            });
        });

        it('should throw an error when quering non existing objects', (done) => {
            objectDataService.findById("test").then(savedObject => {
                
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
        var objectDataService: ObjectDataService;
        
        before((done) => {
            model = new ModelBuilder()
                .to(new ServiceMergeNode())
                .to(new LoggingSinkNode())
                .build();
            objectDataService = model.getDataService(DataObject);

            var object = new SensorObject("123");
            object.setDisplayName("Hello");
            objectDataService.create(object).then(savedObject => {
                done();
            });
        });

        it('should load unknown objects', (done) => {
            var object = new SensorObject("123");
            var frame = new DataFrame();
            frame.addObject(object);
            model.push(frame).then(_ => {
                // Check if it is stored
                objectDataService.findAll().then(objects => {
                    expect(objects[0].getDisplayName()).to.equal("Hello");
                    done();
                }).catch(ex => {
                    done(ex);
                });
            }).catch(ex => {
                done(ex);
            });
        });

    });

    describe('output layer', () => {
        var model: Model<DataFrame, DataFrame>;
        var objectDataService: ObjectDataService;
        
        before((done) => {
            model = new ModelBuilder()
                .to(new LoggingSinkNode())
                .build();
            objectDataService = model.getDataService(DataObject);
            done();
        });

        it('should store objects at the output layer', (done) => {
            var object = new DataObject();
            object.setDisplayName("Test");
            var frame = new DataFrame();
            frame.addObject(object);
            model.push(frame).then(_ => {
                // Check if it is stored
                objectDataService.findAll().then(objects => {
                    expect(objects[0].getDisplayName()).to.equal("Test");
                    done();
                }).catch(ex => {
                    done(ex);
                });
            }).catch(ex => {
                done(ex);
            });
        });

        it('should store unknown data objects at the output layer', (done) => {
            var object = new SensorObject();
            object.setDisplayName("Testabc");
            var frame = new DataFrame();
            frame.addObject(object);
            model.push(frame).then(_ => {
                // Check if it is stored
                objectDataService.findAll().then(objects => {
                    expect(objects[1].getDisplayName()).to.equal("Testabc");
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