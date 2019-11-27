import { expect } from 'chai';
import 'mocha';
import { Model, ListSourceLayer, DataFrame, LoggerOutputLayer, OutputLayer } from '../../src';
import { ModelBuilder } from '../../src/Model';

describe('list source', () => {
    describe('layer', () => {

        it('should pop items from the list', (done) => {
            const list = new Array<DataFrame>();

            const model = new ModelBuilder()
                .withLayer(new ListSourceLayer(list))
                .withLayer(new OutputLayer())
                .build();
            done();
        });

    });
});