import { NodeDataService, NodeData } from "../NodeDataService";

export class DummyNodeDataService<T extends NodeData> extends NodeDataService<T> {
    
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

    public insert(id: string, object: T): Promise<T> {
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
