import { expect } from 'chai';
import 'mocha';
import { Model, ModelBuilder, DataFrame, GraphBuilder, CallbackNode, DataObject, Absolute3DPosition, Absolute2DPosition } from '../../../src';

/**
 * This example shows how two positioning techniques with different
 * reference spaces can be merged or aligned together.
 * 
 * Note that in this example we have knowledge on the difference between
 * the two spaces, in a real-life scenario this type of knowledge has to
 * be obtained using calibration.
 */
describe('example', () => {

    describe('space', () => {
        let model: Model;

        before((done) => {
            ModelBuilder.create()
                .addShape(GraphBuilder.create()
                    .from()
                    .via(new CallbackNode((frame: DataFrame) => {
                        // Manipulate data object using space 1
                        const object = frame.getObjectByUID("testObject");
                        
                    }),new CallbackNode((frame: DataFrame) => {
                        // Manipulate data object using space 2
                        const object = frame.getObjectByUID("testObject");

                    }))
                    .to())
                .build().then((m: Model) => {
                    model = m;
                    const object = new DataObject("testObject");
                    object.currentPosition = new Absolute2DPosition(0, 0);
                    // Add a test object to the model
                    Promise.resolve(model.push(new DataFrame(object))).then(() => {
                        done();
                    });
                });
        });

        it('should calculate moving forward', () =>{
            
        });

    });

});
