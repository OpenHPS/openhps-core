import { CalibrationService } from '../../../src';

export class CustomCalibrationService extends CalibrationService {

    calibrate(time: number): Promise<number> {
        return new Promise((resolve) => {
            let count = 0;
            this.start((object) => {
                if (object.uid === "test") {
                    count++;
                }
            });
            setTimeout(() => {
                this.stop();
                resolve(count);
            }, time);
        });
    }

}
