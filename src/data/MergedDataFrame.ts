import { DataFrame } from "./DataFrame";
import { SerializableObject, SerializableArrayMember } from "./decorators";

@SerializableObject()
export class MergedDataFrame<T extends DataFrame> extends DataFrame {
    private _frames: T[] = new Array();

    @SerializableArrayMember(DataFrame)
    public get frames(): T[] {
        return this._frames;
    }

    public set frames(frames: T[]) {
        this._frames = frames;
    }

    public addFrame(frame: T): void {
        this._frames.push(frame);
    }
}
