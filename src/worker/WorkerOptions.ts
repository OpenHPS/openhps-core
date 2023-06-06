import { Service } from '../service';

export interface WorkerOptions {
    directory?: string;
    /**
     * Pool size, defaults to 4 but should equal the amount of available cores - 1
     */
    poolSize?: number;
    /**
     * Concurrent tasks send to the same worker in the pool
     */
    poolConcurrency?: number;
    /**
     * Worker runner file. When running in the browser, this is the js file named
     * ```worker.openhps-core.min.js```
     */
    worker?: string;
    /**
     * Worker external imports
     */
    imports?: string[];
    /**
     * Worker type
     */
    type?: 'classic' | 'typescript' | 'module';
    args?: any;
    /**
     * Services to clone from main thread. When not specified it will clone all services
     * @default model.findAllServices()
     */
    services?: Service[];
    /**
     * Timeout spawning
     */
    timeout?: number;
}
