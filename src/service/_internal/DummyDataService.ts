import { DataService } from '../DataService';

export class DummyDataService<I, T> extends DataService<I, T> {
    constructor(uid: string, dataType: new () => T) {
        super(undefined);
        this.dataType = dataType;
        this.uid = uid;
    }
}
