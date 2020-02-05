import { DataServiceDriver } from "./DataServiceDriver";
import { Service } from "./Service";

export class DataService<I, T> extends Service {
    private _dataServiceDriver: new (dataType: new () => T) => DataServiceDriver<I, T>;
    private _dataService: DataServiceDriver<I, T>;
    private _dataType: new () => T;

    constructor(dataServiceDriver: new (dataType: new () => T) => DataServiceDriver<I, T>, dataType: new () => T) {
        super(dataType.name);
        this._dataType = dataType;
        this.dataServiceDriver = dataServiceDriver;
    }

    public get dataServiceDriver(): new (dataType: new () => T) => DataServiceDriver<I, T> {
        return this._dataServiceDriver;
    }

    public set dataServiceDriver(dataServiceDriver: new (dataType: new () => T) => DataServiceDriver<I, T>) {
        if (dataServiceDriver !== undefined) {
            this._dataServiceDriver = dataServiceDriver;
            this._dataService = new this._dataServiceDriver(this._dataType);

            this.on("build", (_?: any) => { this._dataService.trigger("build", _); });
            this.on("destroy", (_?: any) => { this._dataService.trigger("destroy", _); });
            this.on("ready", (_?: any) => { this._dataService.trigger("ready", _); });
        }
    }

    public findOne(filter: any): Promise<T> {
        return this._dataService.findOne(filter);
    }
    
    public findById(id: I): Promise<T> {
        return this._dataService.findById(id);
    }

    public findAll(filter?: any): Promise<T[]> {
        return this._dataService.findAll(filter);
    }

    public insert(id: I, object: T): Promise<T> {
        return this._dataService.insert(id, object);
    }

    public delete(id: I): Promise<void> {
        return this._dataService.delete(id);
    }

    public deleteAll(): Promise<void> {
        return this._dataService.deleteAll();
    }

}
