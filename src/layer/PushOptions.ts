/**
 * # OpenHPS: Push options
 */
export class PushOptions {
    public static DEFAULT = new PushOptions();
    process: boolean = true;
    batchSize: number = 1;
}