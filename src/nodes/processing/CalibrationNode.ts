import { DataObject, DataFrame, Constructor } from '../../data';
import type { CalibrationFrameCallback, CalibrationObjectCallback, CalibrationService } from '../../service';
import { ObjectProcessingNode, ObjectProcessingNodeOptions } from '../ObjectProcessingNode';

/**
 * Calibration node for sensors. This node allows intercepts data frames when
 * performing user-aided calibration.
 */
export class CalibrationNode<T extends DataObject = DataObject> extends ObjectProcessingNode {
    protected running: boolean = false;
    protected service: CalibrationService;
    protected options: CalibrationOptions;
    protected frameCallback: CalibrationFrameCallback;
    protected objectCallback: CalibrationObjectCallback;

    constructor(calibrationOptions?: CalibrationOptions) {
        super(calibrationOptions);
        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): void {
        this.service = this.model.findService(this.options.service);
        if (!this.service) {
            throw new Error(`Calibration node requires a calibration service of type '${this.options.service.name}'!`);
        } else {
            (this.service as any).node = this;
        }
    }

    public processObject(dataObject: T): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.running) {
                resolve(dataObject);
                return;
            } else {
                // Forward to service
                Promise.resolve(this.objectCallback(dataObject))
                    .then((object) => {
                        resolve(object as T);
                    })
                    .catch(reject);
            }
        });
    }

    process(dataFrame: DataFrame): Promise<DataFrame> {
        return new Promise((resolve, reject) => {
            if (this.running) {
                if (this.frameCallback) {
                    Promise.resolve(this.frameCallback(dataFrame))
                        .then((frame) => {
                            return super.process((frame as DataFrame) ?? dataFrame);
                        })
                        .then(() => {
                            resolve(undefined);
                        })
                        .catch(reject);
                } else {
                    super.process(dataFrame).then(() => {
                        resolve(undefined);
                    });
                }
            } else {
                resolve(dataFrame);
            }
        });
    }

    start(objectCallback: CalibrationObjectCallback, frameCallback?: CalibrationFrameCallback): void {
        this.objectCallback = objectCallback;
        this.frameCallback = frameCallback;
        this.running = true;
    }

    stop(): void {
        this.running = false;
    }
}

export interface CalibrationOptions extends ObjectProcessingNodeOptions {
    service: Constructor<CalibrationService>;
}
