import { expect } from 'chai';
import 'mocha';
import { KNNFingerprintingNode, ModelBuilder } from '../../../../src';

describe('node knn fingerprinting', () => {

    it('should initialize without fingerprints', (done) => {
        ModelBuilder.create()
            .from()
            .via(new KNNFingerprintingNode({
                weighted: false,
                k: 5
            }))
            .to()
            .build().then(m => {
                done();
            }).catch(done);
    });

});
