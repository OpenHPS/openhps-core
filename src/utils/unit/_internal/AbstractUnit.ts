import { Unit } from "../Unit";

export class AbstractUnit extends Unit {
    public static UNKNOWN = new AbstractUnit((x) => x, (x) => x);

    constructor(toReference: (x: number) => number, fromReference: (x: number) => number) {
        super(toReference, fromReference);
    }
    
} 
