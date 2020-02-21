// import { expect } from 'chai';
// import 'mocha';
// import { DataFrame, DataSerializer, Model, ModelBuilder, CallbackSinkNode, Cartesian3DLocation } from '../../src';
// import { CSVDataSource } from '@openhps/csv';
// import { LPFilterNode, HPFilterNode } from '../../src'; 
// import { MotionDataFrame, MotionSensorObject } from '@openhps/motion';

// describe('node', () => {
//     describe('high-pass filter', () => {
//         describe('idle accelerometer dataset', () => {
//             let testModel: Model<any, any>;
//             let callbackNode: CallbackSinkNode<MotionDataFrame> = new CallbackSinkNode();
//             let csvSource: CSVDataSource<MotionDataFrame>;

//             before((done) => {
//                 csvSource = new CSVDataSource('test/data/idle_1.csv', (row: any) => {
//                     const source = new MotionSensorObject('M1');
//                     source.interval = 16;
//                     const frame = new MotionDataFrame(source);
//                     frame.acceleration = [parseFloat(row['ACCELERATION X']), parseFloat(row['ACCELERATION Y']), parseFloat(row['ACCELERATION Z'])];
//                     frame.gravity = [parseFloat(row['GRAVITY X']), parseFloat(row['GRAVITY Y']), parseFloat(row['GRAVITY Z'])];
//                     frame.rotation = [parseFloat(row['ROTATION X']), parseFloat(row['ROTATION Y']), parseFloat(row['ROTATION Z'])];
//                     frame.rotationRate = [parseFloat(row['ROTATION RATE X']), parseFloat(row['ROTATION RATE Y']), parseFloat(row['ROTATION RATE Z'])];
//                     return frame;
//                 });
               
//                 new ModelBuilder()
//                     .from(csvSource)
//                     .via(new HPFilterNode({
//                         cutOff: 0.05,
//                         sampleRate: 1 / 16.
//                     }, ['_acceleration']))
//                     .via(new LPFilterNode({
//                         cutOff: 20,
//                         sampleRate: 1 / 16.
//                     }, ['_acceleration']))
//                     .to(callbackNode)
//                     .build().then(model => {
//                         testModel = model;
//                         done();
//                     });
//             });
        
//             after(() => {
//                 testModel.trigger('destroy');
//             });

//             // it('should calculate the velocity vector in idle', (done) => {
//             //     callbackNode.callback = (frame: MotionDataFrame) => {
//             //     //   console.log(frame.acceleration);
//             //         setTimeout(() => {
//             //             Promise.resolve(testModel.pull());
//             //         }, 10);
//             //     };
//             //     Promise.resolve(testModel.pull());
//             // }).timeout(10000);

//         });
//     });
// });