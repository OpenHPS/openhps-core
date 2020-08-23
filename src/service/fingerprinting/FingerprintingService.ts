import { Fingerprint, DataSerializer, RelativePosition } from '../../data';
import { DataObjectService } from '../DataObjectService';
import { Service } from '../Service';
import { ObjectProcessingNodeOptions } from '../../nodes';

export abstract class FingerprintingService extends Service {
    public options: FingerprintingOptions;
    public cache: CachedFingerprint[] = [];

    private _dataService: DataObjectService<Fingerprint>;
    public cachedReferences: Set<string> = new Set();

    constructor() {
        super();

        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        if (this.dataService !== undefined) {
            if (this.dataService.isReady()) {
                return this.onUpdate();
            } else {
                return new Promise((resolve, reject) => {
                    this.dataService.once('ready', () => {
                        this.onUpdate()
                            .then(() => {
                                resolve();
                            })
                            .catch(reject);
                    });
                });
            }
        }
    }

    public get dataService(): DataObjectService<Fingerprint> {
        return this._dataService;
    }

    public set dataService(dataService: DataObjectService<Fingerprint>) {
        this._dataService = dataService;
        this._dataService.on('insert', this.onUpdate.bind(this));
        this._dataService.on('delete', this.onUpdate.bind(this));
        this._dataService.on('deleteAll', this.onUpdate.bind(this));
    }

    public abstract onUpdate(): Promise<void>;
}

export interface FingerprintingOptions extends ObjectProcessingNodeOptions {
    defaultValue?: number;
    /**
     * Relative position type
     *
     * @default RelativeDistancePosition
     */
    type?: new () => RelativePosition;
}

export class CachedFingerprint {
    public uid: string;
    public vector: number[] = [];
    public location: any;
    public additionalData: any;

    constructor(fingerprint: Fingerprint) {
        this.uid = fingerprint.uid;
        this.location = DataSerializer.serialize(fingerprint.position);
        fingerprint.relativePositions
            .sort((a: RelativePosition, b: RelativePosition) => {
                if (a.referenceObjectUID < b.referenceObjectUID) {
                    return -1;
                }
                if (a.referenceObjectUID > b.referenceObjectUID) {
                    return 1;
                }
                return 0;
            })
            .forEach((relativePosition) => {
                this.vector.push(relativePosition.referenceValue);
            });
    }
}
