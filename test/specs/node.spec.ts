import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode } from '../../src/nodes/sink';

describe('node', () => {
    describe('uid', () => {
        it('should not be null', () => {
            const node = new LoggingSinkNode();
            expect(node.uid).to.not.equal(null);
        });
    });
});