import {
    Acceleration,
    IMUDataFrame,
    LinearVelocity,
    SerializableArrayMember,
    SerializableMember,
    SerializableObject,
} from '../../../data';
import { Euler, Matrix4, LinearVelocityUnit, Vector3, LengthUnit } from '../../../utils';
import { ProcessingNode, ProcessingNodeOptions } from '../../ProcessingNode';

/**
 * Pedometer processing node
 *
 * Based on:
 *
 * @see {@link https://github.com/MaximilianBuegler/node-pedometer/blob/master/src/pedometer.js}
 * @see {@link https://github.com/MaximilianBuegler/node-kinetics/blob/master/src/kinetics.js}
 * @author Maximilian Bügler
 */
export class PedometerProcessingNode<InOut extends IMUDataFrame> extends ProcessingNode<InOut> {
    protected options: PedometerOptions;

    constructor(options?: PedometerOptions) {
        super(options);
        // Default options
        this.options.windowSize = this.options.windowSize || 1;
        this.options.minPeak = this.options.minPeak || 2;
        this.options.maxPeak = this.options.maxPeak || 8;
        this.options.minStepTime = this.options.minStepTime || 0.3;
        this.options.peakThreshold = this.options.peakThreshold || 0.5;
        this.options.maxStepTime = this.options.maxStepTime || 0.8;
        this.options.meanFilterSize = this.options.meanFilterSize || 1;
        this.options.minConsecutiveSteps = this.options.minConsecutiveSteps || 3;
        this.options.stepSize = this.options.stepSize || 0.7;
    }

    public process(frame: IMUDataFrame): Promise<IMUDataFrame> {
        return new Promise((resolve, reject) => {
            // Get node data for this source object
            let pedometerData: PedometerData;
            this.getNodeData(frame.source)
                .then((data: PedometerData) => {
                    if (!data) {
                        data = new PedometerData();
                    }
                    // Add the frame information
                    data.add(frame);
                    const windowSize = Math.floor(this.options.windowSize * data.frequency);
                    if (data.accelerometerData.length > 4 * windowSize) {
                        data.shift();
                    }
                    pedometerData = data;
                    return this.processPedometer(pedometerData);
                })
                .then((steps) => {
                    // Do not double count steps
                    const previousStep = steps.indexOf(pedometerData.lastStepIndex);
                    if (previousStep !== -1) {
                        steps = steps.slice(previousStep + 1);
                    }
                    if (steps.length > 0) {
                        pedometerData.lastStepIndex = steps[steps.length - 1];
                    }
                    const stepCount = steps.length;
                    // Distance travelled in windowSize
                    const distance = this.options.stepSize * stepCount;
                    const position = frame.source.getPosition();
                    position.linearVelocity = new LinearVelocity(
                        distance / this.options.windowSize,
                        0,
                        0,
                        LinearVelocityUnit.METER_PER_SECOND,
                    );
                    const relativePosition = Vector3.fromArray([0, 0, 0]);
                    relativePosition.applyMatrix4(
                        new Matrix4().makeTranslation(distance / this.options.windowSize, 0, 0),
                    );
                    position.fromVector(
                        position
                            .toVector3(LengthUnit.METER)
                            .add(relativePosition.applyQuaternion(position.orientation)),
                    );
                    return this.setNodeData(frame.source, pedometerData);
                })
                .then(() => {
                    resolve(frame);
                })
                .catch(reject);
        });
    }

    public processPedometer(data: PedometerData): Promise<number[]> {
        return new Promise((resolve) => {
            // Factor in the sampling time
            const windowSize = Math.floor(this.options.windowSize * data.frequency);
            const taoMin = this.options.minStepTime * data.frequency;
            const taoMax = this.options.maxStepTime * data.frequency;

            // Extract verical component from input signals
            const verticalComponent = this._extractVerticalComponents(data.accelerometerData, data.attitudeData);
            let smoothedVerticalComponent = verticalComponent;
            if (this.options.meanFilterSize > 1) {
                smoothedVerticalComponent = this._meanFilter(verticalComponent, this.options.meanFilterSize);
            }

            // Offset is half window size first and last half can not be used
            const window: number[] = verticalComponent.slice(0, windowSize);

            // Max and sum peak of window and settings
            let windowMax = Math.max(this.options.minPeak, Math.min(this.options.maxPeak, Math.max(...window)));
            let windowSum = window.reduce((a, b) => a + b);
            const windowAvg = windowSum / windowSize;
            const offset = Math.ceil(windowSize / 2);

            let steps: number[] = [];
            let lastPeak = data.lastStepIndex;

            for (let i = offset; i < verticalComponent.length - offset - 1; i++) {
                // If the current value minus the mean value of the current window is larger than the thresholded maximum
                // and the values decrease after i, but increase prior to i
                // and the last peak is at least taoMin steps before
                if (
                    verticalComponent[i] >
                        Math.max(this.options.minPeak, this.options.peakThreshold * windowMax + windowAvg) &&
                    smoothedVerticalComponent[i] >= smoothedVerticalComponent[i - 1] &&
                    smoothedVerticalComponent[i] > smoothedVerticalComponent[i + 1] &&
                    lastPeak < i - taoMin
                ) {
                    // Add the current index to the steps array and note it down as last peak
                    if (verticalComponent[i] < this.options.maxPeak) steps.push(i);
                    lastPeak = i;
                }

                // Push next value to the end of the window
                window.push(verticalComponent[i + offset]);

                // remove value from the start of the window
                const removed = window.shift();

                // Update sum of window by substracting the removed and adding the added value
                windowSum += verticalComponent[i + offset] - removed;

                // If the removed value was the maximum or the new value exceeds the old maximum, we recheck the window
                if (removed >= windowMax || verticalComponent[i + offset] > windowMax) {
                    windowMax = Math.max(this.options.minPeak, Math.min(this.options.maxPeak, Math.max(...window)));
                }
            }

            // Remove steps that do not fulfile the minimum consecutive steps requirement
            if (this.options.minConsecutiveSteps > 1) {
                let consecutivePeaks = 1;
                let i = steps.length;
                while (i--) {
                    if (i === 0 || steps[i] - steps[i - 1] < taoMax) {
                        consecutivePeaks++;
                    } else {
                        if (consecutivePeaks < this.options.minConsecutiveSteps) {
                            steps.splice(i, consecutivePeaks);
                        }
                        consecutivePeaks = 1;
                    }
                }
                if (steps.length < this.options.minConsecutiveSteps) {
                    steps = [];
                }
            }
            resolve(steps);
        });
    }

    private _extractVerticalComponents(accelerometerData: Acceleration[], attitudeData: Euler[]): number[] {
        return accelerometerData.map((acceleration, i) => {
            const attitude = attitudeData[i].clone();
            attitude.z = 0;
            return acceleration.clone().applyEuler(attitude).getComponent(2);
        });
    }

    private _meanFilter(arr: number[], size: number): number[] {
        const window: number[] = [];
        return arr.map((val) => {
            if (window.length >= size) window.shift();
            window.push(val);
            return window.reduce((a, b) => a + b) / arr.length;
        });
    }
}

@SerializableObject()
export class PedometerData {
    @SerializableArrayMember(Acceleration)
    accelerometerData: Acceleration[] = [];
    @SerializableArrayMember(Acceleration)
    attitudeData: Euler[] = [];
    @SerializableMember()
    frequency: number;
    @SerializableMember()
    lastStepIndex = -Infinity;

    public add(frame: IMUDataFrame): this {
        this.accelerometerData.push(frame.linearAcceleration);
        this.attitudeData.push(frame.absoluteOrientation.toEuler('ZYX'));
        this.frequency = frame.frequency;
        return this;
    }

    public shift(): this {
        this.lastStepIndex--;
        this.accelerometerData.shift();
        this.attitudeData.shift();
        return this;
    }
}

export interface PedometerOptions extends ProcessingNodeOptions {
    /**
     * Length of the window in seconds
     */
    windowSize?: number;
    /**
     * Minimum magnitude of a steps largest positive peak
     */
    minPeak?: number;
    /**
     * Maximum magnitude of a steps largest postive peak
     */
    maxPeak?: number;
    /**
     * Minimum time in seconds between two steps
     */
    minStepTime?: number;
    /**
     * Minimum ratio of the current window's maximum to be considered a step
     */
    peakThreshold?: number;
    /**
     * Minimum number of consecutive steps to be counted
     */
    minConsecutiveSteps?: number;
    /**
     * Maximum time between two steps to be considered consecutive
     */
    maxStepTime?: number;
    /**
     * Amount of smoothing
     */
    meanFilterSize?: number;
    /**
     * Step size in meters
     */
    stepSize?: number;
}
