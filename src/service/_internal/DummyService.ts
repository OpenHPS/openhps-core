import { Service } from '../Service';

export class DummyService extends Service {
    constructor(uid: string) {
        super();
        this.uid = uid;
    }
}
