import { DataFrame } from '../../../data/DataFrame';
import { ReferenceSpace } from '../../../data/object';
import { Service } from '../../../service/Service';
import { DataService } from '../../../service/DataService';
import { GraphShape } from './GraphShape';
import { Model } from '../../../Model';
import { ServiceProxy } from '../../../service/_internal/ServiceProxy';
import { PushOptions } from '../../options';
import { Serializable } from '../../../data/decorators';
import { DataServiceProxy } from '../../../service/_internal';

/**
 * [[Model]] implementation
 */
export class ModelGraph<In extends DataFrame, Out extends DataFrame>
    extends GraphShape<In, Out>
    implements Model<In, Out>
{
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
    findService<S extends Service>(uid: string): S;
    findService<S extends Service>(serviceClass: Serializable<S>): S;
    findService<S extends Service>(q: any): S {
        if (!q) {
            return undefined;
        } else if (typeof q === 'string') {
            return this._services.get(q) as S;
        } else {
            return Array.from(this._services.values()).filter((s) => s instanceof q)[0] as S;
        }
    }

    /**
     * Find data service
     *
     * @returns {DataService} Found data service
     */
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(uid: string): F;
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(dataType: Serializable<D>): F;
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(object: D): F;
    findDataService<D, F extends DataService<any, D> = DataService<any, D>>(q: any): F {
        let result: F;
        if (q === undefined) {
            result = undefined;
        } else if (typeof q === 'string') {
            // Find by name
            result = this._findDataServiceByUID(q);
        } else if (q.prototype instanceof DataService) {
            // Find by data service class
            result = this.findAllServices(q)[0] as F;
        } else if (q instanceof Function) {
            // Find by constructor
            result = this.findAllDataServices(q)[0] as F;
        } else {
            // Find by instance
            result = this.findDataService(q.constructor);
        }
        return result;
    }

    private _findDataServiceByUID<D, F extends DataService<any, D>>(uid: string): F {
        return Array.from(this._dataServices.values()).filter((s) => s.uid === uid)[0] as F;
    }

    /**
     * Find all services and data services
     *
     * @param {typeof Service} [q] Service class
     * @returns {Service[]} Array of all services
     */
    findAllServices<S extends Service>(q?: Serializable<S>): S[] {
        if (q !== undefined) {
            return (this.findAllServices().filter((s) => s instanceof q) as S[]) || [];
        } else {
            return (Array.from(this._services.values()).concat(Array.from(this._dataServices.values())) as S[]) || [];
        }
    }

    /**
     * Find all data services by data type
     *
     * @param {typeof Service} [q] data type class
     * @returns {Service[]} Array of all services
     */
    findAllDataServices<T, S extends DataService<any, any>>(q?: Serializable<T>): S[] {
        if (q !== undefined) {
            return (
                (this.findAllDataServices()
                    .map((s) => [s, ...this._instanceofPriority(q, s['target'].dataType)])
                    .filter((s) => s[1])
                    .sort((a: any[], b: any[]) => (a[2] === b[2] ? b[0].priority - a[0].priority : a[2] - b[2]))
                    .map((s) => s[0]) as S[]) || []
            );
        } else {
            return (Array.from(this._dataServices.values()) as S[]) || [];
        }
    }

    private _instanceofPriority(obj: any, constr: any): [boolean, number] {
        if (obj === constr) {
            return [true, 0];
        }
        let level = 1;
        while ((obj = Object.getPrototypeOf(obj))) {
            if (obj === constr) {
                return [true, level];
            }
            level++;
        }
        return [false, undefined];
    }

    /**
     * Add service to model
     *
     * @param {Service} service Service to add
     * @param {ProxyHandler} [proxy] Proxy handler
     */
    addService(service: Service, proxy?: ProxyHandler<any>): void {
        service.model = this.graph === undefined ? this : this.model;
        if (service instanceof DataService) {
            // Data service
            this._dataServices.set(service.uid, new Proxy(service, proxy || new DataServiceProxy()));
        } else {
            // Normal service
            this._services.set(service.uid, new Proxy(service, proxy || new ServiceProxy()));
        }
    }

    get referenceSpace(): ReferenceSpace {
        return this._referenceSpace;
    }

    set referenceSpace(space: ReferenceSpace) {
        this._referenceSpace = space;
    }

    push(frame: In | In[], options?: PushOptions): Promise<void> {
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
                .then(() => this.internalSource.push(frame, options))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    destroy(): Promise<boolean> {
        return this.emitAsync('destroy');
    }
}
