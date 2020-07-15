import { AbsolutePosition } from "../position";
import { DataObject } from "../object";

export class Space<L extends AbsolutePosition = AbsolutePosition> extends DataObject {
    /**
     * Scale of the space
     * @default 1.0
     */
    public scale: number = 1.0;

    /**
     * Origin of the space
     * @default [0,0,0]
     */
    public origin: number[] = [0, 0, 0];

    constructor() {
        super();
    }

}
