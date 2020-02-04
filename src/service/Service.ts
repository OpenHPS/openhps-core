/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service {
    private _name: string;
    private _events: Map<string, Array<(..._: any) => any>> = new Map();
    public logger: (level: string, log: any) => void = () => {};

    constructor(name: string = null) {
        this._name = name === null ? this.constructor.name : name;

        this._events.set("ready", new Array());
        this._events.set("build", new Array());
        this._events.set("destroy", new Array());
    }

    /**
     * Get data manager name
     */
    public getName() {
        return this._name;
    }

    public on(event: 'build', callback: () => any): void;
    public on(event: 'destroy', callback: () => any): void;
    public on(event: 'ready', callback: () => any): void;
    /**
     * Register a new event
     * @param event Event name
     * @param callback Event callback
     */
    public on(event: string, callback: (_?: any) => any): void {
        if (this._events.has(event)) {
            const callbacks = this._events.get(event);
            callbacks.push(callback);
        } else {
            const callbacks = new Array();
            this._events.set(event, callbacks);
        }
    }

    public trigger(event: 'destroy', _?: any): Promise<void>;
    public trigger(event: 'build', _?: any): Promise<void>;
    public trigger(event: 'ready', _?: any): Promise<void>;
    /**
     * Trigger an event
     * 
     * @param event Event name to trigger
     * @param _ Parameter for event 
     */
    public trigger(event: string, _?: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._events.has(event)) {
                const callbacks = this._events.get(event);
                const triggerPromises = new Array<Promise<any>>();
                callbacks.forEach(callback => {
                    triggerPromises.push(callback(_));
                });
                Promise.all(triggerPromises).then(function(values: any[]) {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                resolve();
            }
        });
    }

}
