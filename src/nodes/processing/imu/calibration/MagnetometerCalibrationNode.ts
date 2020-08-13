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
            this.getNodeData(object).then(calibrationData => {
                if (calibrationData === undefined) {
                    calibrationData = {
                        x: [],
                        y: [],
                        z: [],
                        scaleX: NaN,
                        scaleY: NaN,
                        scaleZ: NaN
                    };
                }
    
                if (isNaN(calibrationData.scaleX)) {
                    // Calculate hard and soft iron
                    const avgDeltaX = (Math.max(calibrationData.x) + Math.min(calibrationData.x)) / 2;
                    const avgDeltaY = (Math.max(calibrationData.y) + Math.min(calibrationData.y)) / 2;
                    const avgDeltaZ = (Math.max(calibrationData.z) + Math.min(calibrationData.z)) / 2;
        
                    const avgDelta = (avgDeltaX + avgDeltaY + avgDeltaZ) / 3;
        
                    calibrationData.scaleX = avgDelta / avgDeltaX;
                    calibrationData.scaleY = avgDelta / avgDeltaY;
                    calibrationData.scaleZ = avgDelta / avgDeltaZ;
    
                    // Remove measurments from calibration data
                    calibrationData.x = [];
                    calibrationData.y = [];
                    calibrationData.z = [];
                    // Save calibration data
                    Promise.resolve(this.setNodeData(object, calibrationData));
                } else if (calibrationData.x.length < this.options.count && this.options.count !== -1) {
                    // Add measurement
                    calibrationData.x.push(frame.magnetism.x);
                    calibrationData.y.push(frame.magnetism.y);
                    calibrationData.z.push(frame.magnetism.z);
                    // Save calibration data
                    Promise.resolve(this.setNodeData(object, calibrationData));
                } else {
                    frame.magnetism.x = frame.magnetism.x * calibrationData.scaleX;
                    frame.magnetism.y = frame.magnetism.y * calibrationData.scaleY;
                    frame.magnetism.z = frame.magnetism.z * calibrationData.scaleZ;
                }
                resolve(object);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}

export interface MagnetomerCalibrationOptions extends ObjectProcessingNodeOptions {
    count: number;
}

