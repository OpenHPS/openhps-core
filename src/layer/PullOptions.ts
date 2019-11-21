import { DataOptions } from "./DataOptions";

/**
 * # OpenHPS: Pull options
 */
export class PullOptions extends DataOptions {
    public static DEFAULT = new PullOptions();
    oid: string;
}
