import { DataService } from '../DataService';

export class DummyDataService<I, T> extends DataService<I, T> {
    constructor(name: string, dataType: new () => T) {
        super(undefined);
        this.dataType = dataType;
        this.name = name;
    }
}
