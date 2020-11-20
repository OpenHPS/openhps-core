import { DataServiceDriver } from '../DataServiceDriver';

export class DummyDataService<I, T> extends DataServiceDriver<I, T> {
    public findByUID(): Promise<T> {
        return new Promise<T>((resolve) => {
            resolve(undefined);
        });
    }

    public findAll(): Promise<T[]> {
        return new Promise<T[]>((resolve) => {
            resolve(undefined);
        });
    }

    public findOne(): Promise<T> {
        return new Promise<T>((resolve) => {
            resolve(undefined);
        });
    }

    public insert(): Promise<T> {
        return new Promise<T>((resolve) => {
            resolve(undefined);
        });
    }

    public delete(): Promise<void> {
        return new Promise<void>((resolve) => {
            resolve(undefined);
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>((resolve) => {
            resolve(undefined);
        });
    }
}
