import { DataFrame } from '../../../data/DataFrame';
import { ReferenceSpace } from '../../../data/object';
import { Service } from '../../../service/Service';
import { DataService } from '../../../service/DataService';
import { GraphShape } from './GraphShape';
import { Model } from '../../../Model';
import { ServiceProxy } from '../../../service/_internal';
import { PushOptions } from '../../options';

/**
 * [[Model]] implementation
 */
export class ModelGraph<In extends DataFrame, Out extends DataFrame>
    extends GraphShape<In, Out>
    implements Model<In, Out> {
    private _services: Map<string, Service> = new Map();
    private _dataServices: Map<string, DataService<any, any>> = new Map();
    private _referenceSpace: ReferenceSpace;

    /**
     * Create a new OpenHPS model
     *
     * @param {string} name Model name
     */
    constructor(name = 'model') {
        super();
        this.name = name;
        this.referenceSpace = new ReferenceSpace(undefined);

        this.removeAllListeners('build');
        this.removeAllListeners('destroy');
        this.once('build', this._onModelBuild.bind(this));
        this.once('destroy', this._onModelDestroy.bind(this));
    }

    private _onModelBuild(_: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.emit('prebuild', _);
            // First resolve the building of services
            this._buildServices()
                .then(() => {
                    for (const service of this.findAllServices()) {
                        if (!service.isReady()) {
                            service.emit('ready');
                        }
                    }
                    // Build nodes
                    return this._buildNodes(_);
                })
                .then(() => {
                    for (const node of this.nodes) {
                        if (!node.isReady()) {
                            node.emit('ready');
                        }
                    }
                    this.emit('ready');
                    this.emit('postbuild', this);
                    resolve();
                })
                .catch(reject);
        });
    }

    private _buildServices(): Promise<void> {
        return new Promise((resolve, reject) => {
            const buildPromises: Array<Promise<boolean>> = [];
            this._services.forEach((service) => {
                if (!service.isReady()) {
                    buildPromises.push(service.emitAsync('build'));
                }
            });
            this._dataServices.forEach((service) => {
                if (!service.isReady()) {
                    buildPromises.push(service.emitAsync('build'));
                }
            });
            Promise.all(buildPromises)
                .then(() => resolve())
                .catch(reject);
        });
    }

    private _buildNodes(_: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const buildPromises: Array<Promise<boolean>> = [];
            this.nodes.forEach((node) => {
                if (!node.isReady()) {
                    buildPromises.push(node.emitAsync('build', _));
                }
            });
            Promise.all(buildPromises)
                .then(() => resolve())
                .catch(reject);
        });
    }

    private _onModelDestroy(_?: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const destroyPromises: Array<Promise<boolean>> = [];
            this._services.forEach((service) => {
                destroyPromises.push(service.emitAsync('destroy', _));
            });
            this._dataServices.forEach((service) => {
                destroyPromises.push(service.emitAsync('destroy', _));
            });
            this.nodes.forEach((node) => {
                destroyPromises.push(node.emitAsync('destroy', _));
            });
            Promise.all(destroyPromises)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Find service
     *
     * @returns {Service} Found service
     */
    public findService<F extends Service>(name: string): F;
    public findService<F extends Service>(serviceClass: new () => F): F;
    public findService<F extends Service>(q: any): F {
        if (!q) {
            return undefined;
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
            return undefined;
        }
    }

    /**
     * Find data service
     *
     * @returns {DataService} Found data service
     */
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(name: string): F;
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(
        dataType: new () => D,
    ): F;
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(object: D): F;
    public findDataService<D extends any, F extends DataService<any, D> = DataService<any, D>>(q: any): F {
        let result: F;
        if (q === undefined) {
            result = undefined;
        } else if (typeof q === 'string') {
            // Find by name
            result = this._findDataServiceByName(q);
        } else if (q instanceof Function) {
            // Find by constructor
            result = this._findDataServiceByType(q);
        } else {
            // Find by instance
            result = this.findDataService(q.constructor);
        }
        return result;
    }

    private _findDataServiceByType<D extends any, F extends DataService<any, D> = DataService<any, D>>(
        dataType: new () => D,
    ): F {
        // Find by constructor
        let service: F = this._findDataServiceByName(dataType.name);
        if (!service) {
            // Find the parent class
            let parent = Object.getPrototypeOf(dataType);
            while (!service) {
                service = this._findDataServiceByName(parent.name);
                if (service) {
                    return service;
                }
                if (parent.name === 'DataObject') {
                    return undefined;
                }
                parent = Object.getPrototypeOf(parent);
            }
        } else {
            return service;
        }
    }

    private _findDataServiceByName<D extends any, F extends DataService<any, D>>(name: string): F {
        if (this._dataServices.has(name)) {
            return this._dataServices.get(name) as F;
        } else {
            return undefined;
        }
    }

    /**
     * Find all services and data services
     *
     * @param {new () => Service} [q] Service class
     * @returns {Service[]} Array of all services
     */
    public findAllServices<S extends Service>(q?: new () => S): S[] {
        if (q !== undefined) {
            return this.findAllServices().filter((s) => s instanceof q) as S[];
        } else {
            return Array.from(this._services.values()).concat(Array.from(this._dataServices.values())) as S[];
        }
    }

    /**
     * Add service to model
     *
     * @param {Service} service Service to add
     * @param {ProxyHandler} [proxy] Proxy handler
     */
    public addService(service: Service, proxy?: ProxyHandler<any>): void {
        proxy = proxy || new ServiceProxy();
        if (service instanceof DataService) {
            // Data service
            this._dataServices.set(service.name, new Proxy(service, proxy));
        } else {
            // Normal service
            this._services.set(service.name, new Proxy(service, proxy));
        }
    }

    public get referenceSpace(): ReferenceSpace {
        return this._referenceSpace;
    }

    public set referenceSpace(space: ReferenceSpace) {
        this._referenceSpace = space;
    }

    public push(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises: Array<Promise<unknown>> = [];

            // Merge the changes in the frame service
            const frameService = this.findDataService(frame.constructor.name);

            if (frameService) {
                if (Array.isArray(frame)) {
                    frame.forEach((f) => {
                        // Update the frame
                        servicePromises.push(frameService.insert(f.uid, frame));
                    });
                } else {
                    // Update the frame
                    servicePromises.push(frameService.insert((frame as In).uid, frame));
                }
            }

            Promise.all(servicePromises)
                .then(() => this.internalInput.push(frame, options))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    public destroy(): Promise<boolean> {
        return this.emitAsync('destroy');
    }
}
