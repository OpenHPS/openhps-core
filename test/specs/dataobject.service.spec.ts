import { Model, DataFrame, ObjectDataService, OutputLayer, DataObject } from '../../src';

import { expect } from 'chai';
import 'mocha';
import { ModelBuilder } from '../../src/Model';

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

        it('should throw an error when creating an existing object', (done) => {
            var object = new DataObject("1");
            object.setDisplayName("Test");
            objectDataService.create(object).then(savedObject => {
                objectDataService.create(object).then(savedObject => {
                    done(new Error("No error thrown when created same object"));
                }).catch(ex => {
                    done();
                });
            }).catch(ex => {
                done(new Error("Object was not created yet!"));
            });
        });

        it('should find all items', () => {
            objectDataService.findAll().then(objects => {
                expect(objects.length).to.be.gte(1);
            });
        });

    });
    describe('output layer', () => {
        var model: Model<DataFrame,DataFrame>;
        var objectDataService: ObjectDataService;
        
        before((done) => {
            model = new ModelBuilder()
                .withLayer(new OutputLayer())
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

    });
});