import { AbsolutePosition, DataObject } from "../../data";
import { DataObjectService } from "../DataObjectService";

export class DummyDataObjectService<T extends DataObject> extends DataObjectService<T> {
    
    public findByDisplayName(displayName: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve();
        });
    }

    public findByCurrentPosition(position: AbsolutePosition): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resolve();
        });
    }

    public findByParentUID(parentUID: string): Promise<T[]> {
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
