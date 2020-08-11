import { DataFrame, DataObject, ReferenceSpace } from "../../../data";
import { Service, DataService, NodeData, TimeService, DataObjectService, MemoryDataService, DataFrameService, NodeDataService } from "../../../service";
import { GraphImpl } from "./GraphImpl";
import { Model } from "../../../Model";
import { ServiceProxy } from "../../../service/_internal";

/**
 * [[Model]] implementation
 */
export class ModelImpl<In extends DataFrame | DataFrame[] = DataFrame, Out extends DataFrame | DataFrame[] = DataFrame> extends GraphImpl<In, Out> implements Model<In, Out> {
    private _services: Map<string, Service> = new Map();
    private _dataServices: Map<string, DataService<any, any>> = new Map();
    private _referenceSpace: ReferenceSpace;

    /**
     * Create a new OpenHPS model
     */
    constructor(name: string = "model") {
        super();
        this.name = name;
        this.referenceSpace = new ReferenceSpace(undefined);
        
        this._addDefaultServices();

        this.removeAllListeners("build");
        this.removeAllListeners("destroy");
        this.once("build", this._onModelBuild.bind(this));
        this.once("destroy", this._onModelDestroy.bind(this));
    }

    private _onModelBuild(_: any): Promise<void> {
        return new Promise((resolve, reject) => {
            let buildPromises = new Array();
            this._services.forEach(service => {
                if (!service.isReady()) {
                    buildPromises.push(service.emitAsync('build'));
                }
            });
            this._dataServices.forEach(service => {
                if (!service.isReady()) {
                    buildPromises.push(service.emitAsync('build'));
                }
            });

            // First resolve the building of services
            Promise.all(buildPromises).then(() => {
                this._services.forEach(service => {
                    if (!service.isReady()) {
                        service.emit('ready');
                    }
                });
                this._dataServices.forEach(service => {
                    if (!service.isReady()) {
                        service.emit('ready');
                    }
                });

                // Build all nodes
                buildPromises = new Array();
                this.nodes.forEach(node => {
                    if (!node.isReady()) {
                        buildPromises.push(node.emitAsync('build', _));
                    }
                });
                return Promise.all(buildPromises);
            }).then(() => {
                this.nodes.forEach(node => {
                    if (!node.isReady()) {
                        node.emit('ready');
                    }
                });
                
                this.emit('ready');
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onModelDestroy(_?: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const destroyPromises = new Array();
            this._services.forEach(service => {
                destroyPromises.push(service.emit('destroy', _));
            });
            this._dataServices.forEach(service => {
                destroyPromises.push(service.emit('destroy', _));
            });
            this.nodes.forEach(node => {
                destroyPromises.push(node.emit('destroy', _));
            });
            Promise.all(destroyPromises).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _addDefaultServices(): void {
        // Store data objects
        this.addService(new DataObjectService(new MemoryDataService(DataObject)));
        // Store spaces in their own memory data object service
        this.addService(new DataObjectService(new MemoryDataService(ReferenceSpace)));
        // Temporal storage of data frames
        this.addService(new DataFrameService(new MemoryDataService(DataFrame)));
        // Store node data
        this.addService(new NodeDataService(new MemoryDataService(NodeData)));

        this.addService(new TimeService());
    }

    /**
     * Find service
     */
    public findService<F extends Service>(name: string): F;
    public findService<F extends Service>(serviceClass: new () => F): F;
    public findService<F extends Service>(q: any): F {
        if (q === undefined || q === null) {
            return null;
        } else if (typeof q === 'string') {
            // Find by name
            return this._findServiceByName(q);
        } else {
            return this._findServiceByName(q.name);
        }
    }

    private _findServiceByName<F extends Service>(name: string): F {
        if (this._services.has(name)) {
            return this._services.get(name) as F;
        } else {
            return null;
        }
    }

    /**
     * Find data service
     */
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(name: string): F;
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(dataType: new () => D): F;
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(object: D): F;
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(q: any): F {
        if (q === undefined || q === null) {
            return null;
        } else if (typeof q === 'string') {
            // Find by name
            return this._findDataServiceByName(q);
        } else if (q instanceof Function) {
             // Find by constructor
             let service: F = this._findDataServiceByName(q.name);
             if (service === null) {
                 // Find the parent class
                 let parent = Object.getPrototypeOf(q);
                 while (true) {
                     service = this._findDataServiceByName(parent.name);
                     if (service !== null) {
                         return service;
                     }
                     if (parent.name === "DataObject" || parent.name === "DataFrame") {
                         return null;
                     }
                     parent = Object.getPrototypeOf(parent);
                 }
             } else {
                 return service;
             }
        } else {
            // Find by instance
            return this.findDataService(q.constructor);
        }
    }

    private _findDataServiceByName<D extends any, F extends DataService<any, D>>(name: string): F {
        if (this._dataServices.has(name)) {
            return this._dataServices.get(name) as F;
        } else {
            return null;
        }
    }

    /**
     * Find all services and data services
     */
    public findAllServices(): Service[] {
        return Array.from(this._services.values()).concat(Array.from(this._dataServices.values()));
    }

    /**
     * Add service to model
     * @param service Service
     */
    public addService(service: Service): void {
        if (service instanceof DataService) {
            // Data service
            this._dataServices.set(service.name, new Proxy(service , new ServiceProxy()));
        } else {
            // Normal service
            this._services.set(service.name, new Proxy(service , new ServiceProxy()));
        }
    }

    public get referenceSpace(): ReferenceSpace {
        return this._referenceSpace;
    }

    public set referenceSpace(space: ReferenceSpace) {
        this._referenceSpace = space;
    }

    public push(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises = new Array();

            // Merge the changes in the frame service
            let frameService = this.findDataService(frame.constructor.name);
            if (frameService === null || frameService === undefined) { 
                frameService = this.findDataService("DataFrame"); 
            }
            
            if (frameService !== null && frameService !== undefined) { 
                // Update the frame
                servicePromises.push(frameService.insert((frame as DataFrame).uid, frame));
            }

            Promise.all(servicePromises).then(() => {
                this.internalInput.push(frame).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}
