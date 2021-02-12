import { expect } from 'chai';
import 'mocha';
import { TimeConsumingService } from '../../mock/services/TimeConsumingService';

describe("worker service", () => {
    it('should take 10000 ms sequentially', (done) => {
        const service = new TimeConsumingService(1000000);
        const start = Date.now();
        service.someAction().then(() => {
            const end = Date.now();
            const diff = end - start;
            expect(diff).to.be.greaterThan(5000);
            expect(diff).to.be.lessThan(10000);
            done(); 
        });
    });
});
