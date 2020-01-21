import { Model, DataFrame, ModelBuilder, LoggingSinkNode, DataObject } from "../../src";
import { DataFrameService } from "../../src/service/DataFrameService";
import { expect } from 'chai';

describe('data frame service', () => {
    describe('output layer', () => {
        var model: Model<DataFrame, DataFrame>;
        var frameDataService: DataFrameService<DataFrame>;
        
        before((done) => {
            model = new ModelBuilder()
                .to(new LoggingSinkNode())
                .build();
            frameDataService = model.findDataServiceByName("DataFrame");
            done();
        });
    
        it('should delete frame at the output layer', (done) => {
            var object = new DataObject();
            object.displayName = "Test";
            var frame = new DataFrame();
            frame.addObject(object);
            model.push(frame).then(_ => {
                frameDataService.findAll().then(frames => {
                    expect(frames.length).to.equal(0);
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