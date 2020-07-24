import { DataFrame, DataObject, ReferenceSpace } from "../../../data";
import { Service, DataService, NodeData } from "../../../service";
import { GraphImpl } from "./GraphImpl";
import { Model } from "../../../Model";
import { MemoryDataFrameService, MemoryDataObjectService, MemoryNodeDataService } from "../../../service/memory";
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
        this.addService(new MemoryDataObjectService<DataObject>());
        // Store spaces in their own memory data object service
        this.addService(new MemoryDataObjectService<ReferenceSpace>());
        // Temporal storage of data frames
        this.addService(new MemoryDataFrameService<DataFrame>());
        // Store node data
        this.addService(new MemoryNodeDataService(NodeData));
    }

    public findServiceByName<F extends Service>(name: string): F {
        if (this._services.has(name)) {
            return this._services.get(name) as F;
        } else {
            return null;
        }
    }

    public findDataServiceByName<F extends DataService<any, any>>(name: string): F {
        if (this._dataServices.has(name)) {
            return this._dataServices.get(name) as F;
        } else {
            return null;
        }
    }

    public findServiceByClass<F extends Service>(serviceClass: new () => F): F {
        return this.findServiceByName(serviceClass.name);
    }

    /**
     * Get data service by data type
     * @param dataType Data type
     */
    public findDataService<D extends DataObject | DataFrame | Object, F extends DataService<any, D>>(dataType: new () => D): F {
        if (this._dataServices.has(dataType.name)) {
            return this._dataServices.get(dataType.name) as F;
        } else {
            // Find the parent class
            let parent = Object.getPrototypeOf(dataType);
            while (true) {
                if (this._dataServices.has(parent.name)) {
                    return this._dataServices.get(parent.name) as F;
                }
                if (parent.name === "DataObject" || parent.name === "DataFrame") {
                    return null;
                }
                parent = Object.getPrototypeOf(parent);
            }
        }
    }

    /**
     * Get data service by data object
     * @param dataObject Data object instance
     */
    public findDataServiceByObject<D extends DataObject, F extends DataService<any, D>>(dataObject: D): F {
        return this.findDataServiceByName(dataObject.constructor.name);
    }

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
            let frameService = this.findDataServiceByName(frame.constructor.name);
            if (frameService === null || frameService === undefined) { 
                frameService = this.findDataServiceByName("DataFrame"); 
            }
            
            if (frameService !== null && frameService !== undefined) { 
                // Update the frame
                servicePromises.push(frameService.insert(frame));
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
