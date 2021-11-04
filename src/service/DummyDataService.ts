import { DataService } from './DataService';
import { Serializable } from '../data/decorators';

export class DummyDataService<I, T> extends DataService<I, T> {
    private _dataType: Serializable<T>;

    constructor(uid: string, dataType: Serializable<T>) {
        super(undefined);
        this.uid = uid;
        this._dataType = dataType;
    }

    get dataType(): Serializable<T> {
        return this._dataType;
    }
}
