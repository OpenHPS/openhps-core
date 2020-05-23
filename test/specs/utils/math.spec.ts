import { expect } from 'chai';
import 'mocha';
import * as math from '../../../src/utils/_internal/Math';

describe('math.js', () => {

    it('should support .add()', () => {
        const result = math.add([1, 1], [2, 2]) as number[];
        expect(result[0]).to.equal(3);
    });

    it('should support .subtract()', () => {
        const result = math.subtract([1, 1], [2, 2]) as number[];
        expect(result[0]).to.equal(-1);
    });


});
