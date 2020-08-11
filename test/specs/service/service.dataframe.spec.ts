import 'mocha';
import { Model, DataFrame, ModelBuilder, LoggingSinkNode, DataObject } from "../../../src";
import { DataFrameService } from "../../../src/service/DataFrameService";
import { expect } from 'chai';

describe('data frame service', () => {

    describe('output layer', () => {
        var model: Model<DataFrame, DataFrame>;
        var frameDataService: DataFrameService<DataFrame>;
        
        before(async () => {
            model = await ModelBuilder.create()
                .from()
                .to(new LoggingSinkNode())
                .build();
            frameDataService = model.findDataService("DataFrame");
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

    describe('querying', () => {
        var frameDataService: DataFrameService<DataFrame>;
        
        before((done) => {
            ModelBuilder.create()
                .from()
                .to(new LoggingSinkNode())
                .build().then(model => {
                    frameDataService = model.findDataService("DataFrame");
                    
                    const frame1 = new DataFrame(new DataObject("abc"));
                    frame1.createdTimestamp = Date.parse("10 Mar 1995 00:00:00 GMT");
        
                    const frame2 = new DataFrame(new DataObject("cba"));
                    frame2.createdTimestamp = Date.parse("10 Mar 1995 01:00:00 GMT");
        
                    const frame3 = new DataFrame(new DataObject("abc"));
                    frame3.createdTimestamp = Date.parse("10 Mar 1995 02:00:00 GMT");
        
                    Promise.all([
                        frameDataService.insert(frame1.uid, frame1),
                        frameDataService.insert(frame2.uid, frame2),
                        frameDataService.insert(frame3.uid, frame3)])
                    .then(() => {
                        done();
                    }).catch(ex => {
                        done(ex);
                    });
                });
        });
    
        it('should find data frames before a certain date', (done) => {
            frameDataService.findBefore(Date.parse("10 Mar 1995 01:30:00 GMT")).then(frames => {
                expect(frames.length).to.equal(2);
                done();
            }).catch(ex => {
                done(ex);
            });
        });
    
        it('should find data frames after a certain date', (done) => {
            frameDataService.findAfter(Date.parse("10 Mar 1995 01:30:00 GMT")).then(frames => {
                expect(frames.length).to.equal(1);
                done();
            }).catch(ex => {
                done(ex);
            });
        });

        it('should find data frames containing an object', (done) => {
            frameDataService.findByDataObjectUID("abc").then(frames => {
                expect(frames.length).to.equal(2);
                done();
            }).catch(ex => {
                done(ex);
            });
        });

    });
});