import { expect } from 'chai';
import 'mocha';
import { OutputLayer } from '../../src';

describe('layer', () => {
    describe('name', () => {
        it('should be the class name', () => {
            const layer = new OutputLayer();
            expect(layer.getName()).to.equal("OutputLayer");
        });
    });
});