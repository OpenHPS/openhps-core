import { DataService, DataObject, DataObjectService, MemoryDataService } from '../../../src';
import { expect } from 'chai';
import { DataServiceProxy } from '../../../src/service/_internal';

describe('proxy', () => {
    describe('data object service', () => {
        let proxy: DataService<string, DataObject>;

        before(() => {
            const service = new DataObjectService(new MemoryDataService(DataObject));
            proxy = new Proxy(service, new DataServiceProxy());
        });

        it('should be able to proxy name requests', () => {
            expect(proxy.uid).to.equal('DataObject');
        });

        it('should be able to proxy function calls', (done) => {
            proxy.insert('123', new DataObject('123')).then(() => {
                done();
            });
        });
    });
});
