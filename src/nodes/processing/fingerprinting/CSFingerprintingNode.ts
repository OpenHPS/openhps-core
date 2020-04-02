import { DataFrame, DataObject, Fingerprint, DataSerializer, RelativeLocation } from "../../../data";
import { Model } from "../../../Model";
import { DataObjectService } from "../../../service";
import { FingerprintingNode } from "./FingerprintingNode";
import * as math from 'mathjs';

/**
 * Compressive-sensing based fingerprinting processing node
 */
export class CSFingerprintingNode<InOut extends DataFrame> extends FingerprintingNode<InOut> {
    private _options: CSFingerprintingOptions;
    private _cacheObjects: Set<string> = new Set();
    private _cache: Map<number[], CachedFingerprint[]> = new Map();

    constructor(options: CSFingerprintingOptions = new CSFingerprintingOptions(), filterFn?: (object: DataObject) => boolean) {
        super(filterFn);
        const defaultOptions = new CSFingerprintingOptions();
        // tslint:disable-next-line
        this._options = Object.assign(defaultOptions, options);
        this._options.orientations.forEach(orientation => {
            this._cache.set(orientation, new Array());
        });
        this.once('build', this._onBuild.bind(this));
    }

    protected get cache(): Map<number[], CachedFingerprint[]> {
        return this._cache;
    }

    protected get options(): CSFingerprintingOptions {
        return this._options;
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const fingerprintService = (this.graph as Model<any, any>).findDataService(Fingerprint) as DataObjectService<Fingerprint>;
            fingerprintService.findAll().then(fingerprints => {
                /* Add missing reference locations (objects not in range) */
                fingerprints.forEach(fingerprint => {
                    fingerprint.relativeLocations.forEach(relativeLocation => {
                        if (!this._cacheObjects.has(relativeLocation.referenceObjectUID))
                            this._cacheObjects.add(relativeLocation.referenceObjectUID);
                    });
                });
                
                /* Cache fingerprints to simple vectors */
                fingerprints.forEach(fingerprint => {
                    // Complete missing references
                    this._cacheObjects.forEach(relativeObject => {
                        if (!fingerprint.hasRelativeLocation(relativeObject)) {
                            const relativeLocation = new RelativeLocation();
                            relativeLocation.referenceObjectUID = relativeObject;
                            relativeLocation.referenceValue = this.options.defaultValue;
                            fingerprint.addRelativeLocation(relativeLocation);
                        }
                    });
                    const cachedFingerprint = new CachedFingerprint(fingerprint);
                });

                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }
    
    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            
        });
    }

}

class CSFingerprintingOptions {
    public orientations: number[][] = [];
    public defaultValue?: number = 0;
}

class CachedFingerprint {
    public uid: string;
    public orientation: number[];
    public vector: number[] = [];
    public location: any;

    constructor(fingerprint: Fingerprint) {
        this.uid = fingerprint.uid;
        this.location = DataSerializer.serialize(fingerprint.currentLocation);
        this.orientation = fingerprint.currentLocation.velocity;
        fingerprint.relativeLocations.sort(function(a: RelativeLocation, b: RelativeLocation) {
            if (a.referenceObjectUID < b.referenceObjectUID) { return -1; }
            if (a.referenceObjectUID > b.referenceObjectUID) { return 1; }
            return 0;
        }).forEach(relativeLocation => {
            this.vector.push(relativeLocation.referenceValue);
        });
    }
}

