import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode, CallbackSinkNode } from '../../../src/nodes/sink';
import { ModelBuilder, CallbackSourceNode, DataFrame } from '../../../src';

describe('node', () => {
    describe('xxx', () => {
        it('should not be null', () => {
            ModelBuilder.create()
                .from(new CallbackSourceNode(() => {
                    return null;
                }))
                .to(new CallbackSinkNode((frame: DataFrame) => {

                }))
                .build();
        });
    });
});