import { DataServiceDriver } from "../DataServiceDriver";

export class DummyDataService<I, T> extends DataServiceDriver<I, T> {
    
    public findByUID(): Promise<T> {
        return new Promise<T>(resolve => {
            resolve();
        });
    }

    public findAll(): Promise<T[]> {
        return new Promise<T[]>(resolve => {
            resolve();
        });
    }

    public findOne(): Promise<T> {
        return new Promise<T>(resolve => {
            resolve();
        });
    }

    public insert(): Promise<T> {
        return new Promise<T>(resolve => {
            resolve();
        });
    }

    public delete(): Promise<void> {
        return new Promise<void>(resolve => {
            resolve();
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>(resolve => {
            resolve();
        });
    }

}
