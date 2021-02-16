import { Service } from '../Service';

export class DummyService extends Service {
    constructor(name: string) {
        super();
        this.name = name;
    }
}
