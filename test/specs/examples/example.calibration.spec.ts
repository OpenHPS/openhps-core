import { expect } from 'chai';
import 'mocha';
import {
    Absolute2DPosition,
    CallbackSourceNode,
    DataFrame,
    DataObject,
    GraphBuilder,
    Model,
    ModelBuilder,
    ReferenceSpace,
} from '../../../src';

describe('example calibration', () => {
    let model: Model;
    let defaultSpace: ReferenceSpace;

    before((done) => {
        ModelBuilder.create()
            .addShape(GraphBuilder.create() // Source lane 1
                .from(new CallbackSourceNode(() => {
                    const object = new DataObject("mvdewync");
                    object.setPosition(new Absolute2DPosition(0, 0));
                    return new DataFrame(object);
                }))
                .to())
            .addShape(GraphBuilder.create() // Source lane 2
                .from(new CallbackSourceNode(() => {
                    const object = new DataObject("mvdewync");
                    object.setPosition(new Absolute2DPosition(0, 0));
                    return new DataFrame(object);
                }))
                .to())
            .build().then((createdModel: Model) => {
                model = createdModel;
                defaultSpace = model.referenceSpace as ReferenceSpace;
                done();
            });
    });
});
