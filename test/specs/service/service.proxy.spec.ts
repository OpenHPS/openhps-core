import { DataService, DataObject, MemoryDataObjectService } from "../../../src";
import { DataServiceProxy } from '../../../src/service/_internal';
import { expect } from 'chai';

describe('proxy', () => {

    describe('data object service', () => {
        var proxy: DataService<string, DataObject>;

        before(() => {
            const service = new MemoryDataObjectService(DataObject);
            proxy = new Proxy(service, new DataServiceProxy());
        });

        it('should be able to proxy name requests', () => {
            expect(proxy.name).to.equal("DataObject");
        });

        it('should be able to proxy function calls', (done) => {
            proxy.insert(new DataObject("123")).then(() => {
                done();
            });
        });

    });
    
});