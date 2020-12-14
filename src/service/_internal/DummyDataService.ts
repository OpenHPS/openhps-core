import { DataService } from '../DataService';

export class DummyDataService<I, T> extends DataService<I, T> {
    constructor(dataType: new () => T) {
        super(undefined);
        this.dataType = dataType;
        this.name = this.dataType.name;
    }
}
