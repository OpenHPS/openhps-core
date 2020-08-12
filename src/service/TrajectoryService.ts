import { DataObject, AbsolutePosition } from "../data";
import { DataService } from "./DataService";

export abstract class TrajectoryService<T extends DataObject> extends DataService<string, DataObject> {

    public abstract findPosition(uid: string): Promise<AbsolutePosition>;

    public abstract findTrajectory(uid: string, start?: Date, end?: Date): Promise<AbsolutePosition[]>;

}
