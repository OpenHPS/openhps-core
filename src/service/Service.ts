/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service {
    private _name: string;
    private _events: Map<string, Array<{ callback: (..._: any) => any, once: boolean }>> = new Map();
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

    public on(event: 'build', callback: (graphBuild: any) => any): void;
    public on(event: 'destroy', callback: () => any): void;
    public on(event: 'ready', callback: () => any): void;
    /**
     * Register a new event
     * @param event Event name
     * @param callback Event callback
     */
    public on(event: string, callback: (_?: any) => any): void {
        if (this._events.has(event)) {
            const events = this._events.get(event);
            events.push({ callback, once: false });
        } else {
            const callbacks = new Array({ callback, once: false });
            this._events.set(event, callbacks);
        }
    }

    public once(event: 'build', callback: (graphBuild: any) => any): void;
    public once(event: 'destroy', callback: () => any): void;
    public once(event: 'ready', callback: () => any): void;
    /**
     * Register a new event
     * @param event Event name
     * @param callback Event callback
     */
    public once(event: string, callback: (_?: any) => any): void {
        if (this._events.has(event)) {
            const events = this._events.get(event);
            events.push({ callback, once: true });
        } else {
            const callbacks = new Array({ callback, once: true });
            this._events.set(event, callbacks);
        }
    }

    public emit(event: 'destroy', _?: any): Promise<void>;
    public emit(event: 'build', graphBuilder: any): Promise<void>;
    public emit(event: 'ready', _?: any): Promise<void>;
    /**
     * Emit an event
     * 
     * @param event Event name to trigger
     * @param _ Parameter for event 
     */
    public emit(event: string, _?: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._events.has(event)) {
                const events = this._events.get(event);
                const triggerPromises = new Array<Promise<any>>();
                const expiredCallbacks = new Array();
                events.forEach(e => {
                    triggerPromises.push(e.callback(_));
                    // Remove events that should only trigger once
                    if (e.once) {
                        expiredCallbacks.push(e);
                    }
                });
                Promise.all(triggerPromises).then(function(values: any[]) {
                    // Remove events that should only trigger once
                    if (expiredCallbacks.length !== 0) {
                        expiredCallbacks.forEach(expiredCallback => {
                            events.splice(events.indexOf(expiredCallback), 1);
                        });
                        this._events.set(event, events);
                    }
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
