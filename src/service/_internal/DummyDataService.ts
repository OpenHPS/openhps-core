import { DataService } from "../DataService";

export class DummyDataService<I, T> extends DataService<I, T> {
    
    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resolve();
        });
    }

    public findAll(): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve();
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resolve();
        });
    }

    public delete(id: I): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }
}
