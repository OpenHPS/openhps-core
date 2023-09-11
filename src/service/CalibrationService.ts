import { DataFrame, DataObject } from '../data';
import type { CalibrationNode } from '../nodes';
import { DataObjectService } from './DataObjectService';

/**
 * Calibration service. This service has to be used together with a [[CalibrationNode]]
 * that is placed behind the source node that is used for calibration.
 *
 * When a user-calibration is started, the calibration node will intercept all data frames.
 *
 * ## Usage
 * ```typescript
 * const model = await ModelBuilder.create()
 *  .addService(new MyCalibrationService())
 *  .from(new MyUncalibratedSensor())
 *  .via(new CalibrationNode({
 *      service: MyCalibrationService
 *  }))
 *  .via(...)
 *  .to(...).build();
 *
 * function whenUserClicksCalibrate() {
 *  model.findService(MyCalibrationService).calibrate();
 * }
 * ```
 */
export abstract class CalibrationService<T extends DataObject = any> extends DataObjectService<T> {
    // Registered node
    protected node: CalibrationNode;

    /**
     * Perform calibration. A calibration service must override this abstract method
     * with the appropriate arguments and response.
     *
     * Examples:
     * "Calibrate a fingerprint at a particular location for 30 seconds"
     *      `calibrate(position: AbsolutePosition, time: number): Promise<void>`
     *
     * "Calibrate an IMU sensor that has to be performed in multiple orientations"
     *      `calibrate(userCallback: (orientation: Orientation) => Promise<void>): Promise<void>`
     * @param args
     */
    abstract calibrate(...args: any[]): Promise<any>;

    /**
     * Start the calibration interception. Make sure to enable
     * any passive sources.
     * @param {CalibrationObjectCallback} [objectCallback] Object callback
     * @param {CalibrationFrameCallback} [frameCallback] Frame callback
     */
    protected start(objectCallback?: CalibrationObjectCallback, frameCallback?: CalibrationFrameCallback): void {
        if (!this.node) {
            throw new Error(`Calibration node did not register itself to the calibration service!`);
        }
        this.node.start(objectCallback, frameCallback);
    }

    /**
     * Stop the calibration interception.
     */
    protected stop(): void {
        if (!this.node) {
            throw new Error(`Calibration node did not register itself to the calibration service!`);
        }
        this.node.stop();
    }

    /**
     * Suspend the calibration interception. This will still intercept data frames, but the
     * callbacks will be cleared.
     */
    protected suspend(): void {
        if (!this.node) {
            throw new Error(`Calibration node did not register itself to the calibration service!`);
        }
        this.node.suspend();
    }
}

export type CalibrationFrameCallback = (frame: DataFrame) => Promise<DataFrame | void> | DataFrame | void;
export type CalibrationObjectCallback = (object: DataObject) => Promise<DataObject | void> | DataObject | void;
