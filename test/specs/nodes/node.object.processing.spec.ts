import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataFrame, DataObject, ObjectProcessingNode, CallbackSinkNode, GraphOptions, Accelerometer, LinearAccelerationSensor } from '../../../src';

describe('ObjectProcessingNode', () => {
    describe('uid changes', () => {
        it('should allow added objects', (done) => {
            ModelBuilder.create()
                .from()
                .via(new (class X extends ObjectProcessingNode<DataFrame> {

                    public processObject(dataObject: DataObject, dataFrame?: DataFrame, options?: GraphOptions): Promise<DataObject> {
                        return new Promise((resolve) => {
                            dataFrame.getSensor(Accelerometer, "test")
                            resolve(dataObject);
                        });
                    }

                })())
                .to(new CallbackSinkNode((frame: DataFrame) => {
                    expect(frame.getObjects().length).to.equal(2);
                    done();
                })).build().then(model => {
                    const frame = new DataFrame(new LinearAccelerationSensor("123"));
                    model.once('error', done);
                    model.push(frame);
                }).catch(done);
        });

        it('should replace the objects where the uid changes', (done) =>{
            ModelBuilder.create()
                .from()
                .via(new (class X extends ObjectProcessingNode<any> {

                    public processObject(dataObject: DataObject, dataFrame?: any, options?: GraphOptions): Promise<DataObject> {
                        return new Promise((resolve) => {
                            dataObject.uid += "abc";
                            resolve(dataObject);
                        });
                    }

                })())
                .to(new CallbackSinkNode((frame: DataFrame) => {
                    expect(frame.getObjects().length).to.equal(2);
                    expect(frame.source.uid).to.eql("123abc");
                    done();
                })).build().then(model => {
                    const frame = new DataFrame(new DataObject("123"));
                    frame.addObject(new DataObject("x"));

                    model.once('error', done);
                    model.push(frame);
                }).catch(done);
        });
    });
});
