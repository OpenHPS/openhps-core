import { DataService } from "./DataService";
import { DataObject, AbsolutePosition } from "../data";

export abstract class TrajectoryService<T extends DataObject> extends DataService<string, DataObject> {

    constructor(dataType: new () => T | DataObject = DataObject, options?: any) {
        super(dataType as new () => T, options);
    }

    public abstract findPosition(uid: string): Promise<AbsolutePosition>;

    public abstract findTrajectory(uid: string, start?: Date, end?: Date): Promise<AbsolutePosition[]>;
    
}
