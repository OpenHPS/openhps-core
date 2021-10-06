import { expect } from 'chai';
import 'mocha';
import {
    ModelBuilder,
    DataFrame,
    DataObject,
    ProcessingNode
} from '../../../src';

describe('ProcessingNode', () => {

    describe("getNodeData()", () => {
        it('should load node data with default', (done) => {
            ModelBuilder.create()
                .from()
                .via(new (class X extends ProcessingNode<any, any> {
                    process(data: DataFrame): Promise<DataFrame> {
                        return new Promise((resolve) => {
                            this.getNodeData(data.source, {
                                test: "abc"
                            }).then(data => {
                                expect(data.test).to.equal("abc");
                                done();
                                resolve(undefined);
                            }).catch(done);
                        });
                    }
                }))
                .to()
                .build().then(model => {
                    model.push(new DataFrame(new DataObject("abc")));
                });
        });
    });

});
