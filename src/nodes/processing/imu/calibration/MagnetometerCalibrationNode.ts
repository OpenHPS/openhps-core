import { ObjectProcessingNode, ObjectProcessingNodeOptions } from "../../../ObjectProcessingNode";
import { DataObject, IMUDataFrame } from "../../../../data";

export class MagnetometerCalibrationNode extends ObjectProcessingNode<IMUDataFrame> {

    constructor(options: MagnetomerCalibrationOptions) {
        super(options);
    }

    public get options(): MagnetomerCalibrationOptions {
        return super.options as MagnetomerCalibrationOptions;
    }

    public processObject(object: DataObject, frame: IMUDataFrame): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            this.getNodeData(object).then(async calibrationData => {
                if (calibrationData === undefined) {
                    // Default calibration data
                    calibrationData = {
                        xMax: 0,
                        xMin: 0,
                        yMax: 0,
                        yMin: 0,
                        zMax: 0,
                        zMin: 0,
                        count: 0,
                        scaleX: NaN,
                        scaleY: NaN,
                        scaleZ: NaN
                    };
                }
                
                if (isNaN(calibrationData.scaleX) && calibrationData.count < this.options.count && this.options.count !== -1) {
                    // Add measurement
                    calibrationData.xMax = Math.max(frame.magnetism.x, calibrationData.xMax);
                    calibrationData.xMin = Math.min(frame.magnetism.x, calibrationData.xMin);

                    calibrationData.yMax = Math.max(frame.magnetism.y, calibrationData.yMax);
                    calibrationData.yMin = Math.min(frame.magnetism.y, calibrationData.yMin);

                    calibrationData.zMax = Math.max(frame.magnetism.z, calibrationData.zMax);
                    calibrationData.zMin = Math.min(frame.magnetism.z, calibrationData.zMin);

                    calibrationData.count += 1;
                    // Save calibration data
                    await this.setNodeData(object, calibrationData);
                } else if (isNaN(calibrationData.scaleX) && calibrationData.count >= this.options.count) {
                    // Calculate hard and soft iron
                    const avgDeltaX = (calibrationData.xMax + calibrationData.xMin) / 2;
                    const avgDeltaY = (calibrationData.yMax + calibrationData.yMin) / 2;
                    const avgDeltaZ = (calibrationData.zMax + calibrationData.zMin) / 2;
                    const avgDelta = (avgDeltaX + avgDeltaY + avgDeltaZ) / 3;
        
                    calibrationData.scaleX = avgDelta / avgDeltaX;
                    calibrationData.scaleY = avgDelta / avgDeltaY;
                    calibrationData.scaleZ = avgDelta / avgDeltaZ;
                    // Save calibration data
                    await this.setNodeData(object, calibrationData);
                } else {
                    frame.magnetism.x = frame.magnetism.x * calibrationData.scaleX;
                    frame.magnetism.y = frame.magnetism.y * calibrationData.scaleY;
                    frame.magnetism.z = frame.magnetism.z * calibrationData.scaleZ;
                }
                resolve(object);
            }).catch(reject);
        });
    }

}

export interface MagnetomerCalibrationOptions extends ObjectProcessingNodeOptions {
    count: number;
}

