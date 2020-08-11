import { DataService } from "./DataService";
import { DataObject, AbsolutePosition } from "../data";
import { DataServiceImpl } from "./DataServiceImpl";

export abstract class TrajectoryService<T extends DataObject> extends DataServiceImpl<string, DataObject> {

    constructor(dataService: DataService<string, T>, dataType: new () => T | DataObject = DataObject) {
        super(dataService, dataType as new () => T);
    }

    public abstract findPosition(uid: string): Promise<AbsolutePosition>;

    public abstract findTrajectory(uid: string, start?: Date, end?: Date): Promise<AbsolutePosition[]>;

}
