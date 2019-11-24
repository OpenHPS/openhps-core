/**
 * # OpenHPS: Data options
 */
export abstract class DataOptions {
    process: boolean = true;
    batchSize: number = 1;
}

/**
 * # OpenHPS: Pull options
 */
export class PullOptions extends DataOptions {
    public static DEFAULT = new PullOptions();
    oid: string;
}

/**
 * # OpenHPS: Push options
 */
export class PushOptions extends DataOptions {
    public static DEFAULT = new PushOptions();
}
