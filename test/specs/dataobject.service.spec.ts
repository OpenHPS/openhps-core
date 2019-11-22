import { Model, DataFrame, ObjectDataService, OutputLayer, DataObject } from '../../src';

import { expect } from 'chai';
import 'mocha';

describe('data object', () => {
    describe('service', () => {
        var model: Model<DataFrame,DataFrame>;
        var objectDataService: ObjectDataService;

        before((done) => {
            model = new Model();
            model.addLayer(new OutputLayer());
            objectDataService = model.getDataService(DataObject);
            var object = new DataObject("1");
            object.setDisplayName("Test");
            objectDataService.create(object).then(savedObject => {
                done();
            });
        });
        
        it('should store objects', (done) => {
            var object = new DataObject("2");
            object.setDisplayName("Test");
            objectDataService.create(object).then(savedObject => {
                expect(savedObject.getId()).to.equal("2");
                expect(savedObject.getDisplayName()).to.equal("Test");
                objectDataService.findById("2").then(savedObject => {
                    expect(savedObject.getId()).to.equal("2");
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
});