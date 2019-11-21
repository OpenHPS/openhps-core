import { DataOptions } from "./DataOptions";

/**
 * # OpenHPS: Push options
 */
export class PushOptions extends DataOptions {
    public static DEFAULT = new PushOptions();
    process: boolean = true;
    batchSize: number = 1;
}
