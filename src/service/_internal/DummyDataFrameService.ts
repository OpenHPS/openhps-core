import { DataFrame } from "../../data";
import { DataFrameService } from "../DataFrameService";

export class DummyDataFrameService<T extends DataFrame> extends DataFrameService<T> {
    
    public findByDataObjectUID(uid: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve();
        });
    }

    public findBefore(timestamp: number): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve();
        });
    }

    public findAfter(timestamp: number): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve();
        });
    }

    public findByUID(uid: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resolve();
        });
    }

    public findAll(): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve();
        });
    }

    public insert(object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resolve();
        });
    }

    public delete(id: string): Promise<void> {
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
