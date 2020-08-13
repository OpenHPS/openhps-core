import { expect } from 'chai';
import 'mocha';


describe('node', () => {
    describe('processing', () => {
        describe('calibration', () => {
            describe('magnetometer', () => {

                it('should calibrate', (done) => {
                    done();
                    // const source = new CSVDataSource('test/data/magnetometer_calibration.csv', (row: any) => {
                    //     const source = new IMUSensorObject('M1');
                    //     source.frequency = 1000. / 16;
                    //     const frame = new IMUDataFrame(source);
                    //     frame.magnetism = new Magnetism(parseFloat(row['Bx']), parseFloat(row['By']), parseFloat(row['Bz']));
                    //     return frame as any;
                    // });

                    // ModelBuilder.create()
                    //     .addShape(GraphBuilder.create()
                    //         .from(source as any as SourceNode<any>)
                    //         .via(new MagnetometerCalibrationNode({
                    //             count: 500
                    //         }))
                    //         .to(new CallbackSinkNode(frame => {
                    //             frame.source;
                    //         })))
                    //     .build().then(model => {
                    //         const pullPromises = new Array();
                    //         for (let i = 0 ; i < 1000 ; i++) {
                    //             pullPromises.push(model.pull());
                    //         }
                    //         Promise.all(pullPromises).then(() => {

                    //         });
                    //     });
                }).timeout(10000);
            });
       });
    });
});