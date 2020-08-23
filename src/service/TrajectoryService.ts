import { AbsolutePosition, DataObject } from '../data';
import { DataService } from './DataService';
import { FilterQuery } from './FilterQuery';

export class TrajectoryService<T extends DataObject> extends DataService<PositionIdentifier, T> {
    /**
     * Find the last stored position of an object.
     *
     * @param {string} uid Unique identifier of data object
     * @returns {Promise<AbsolutePosition>} Promise of last known position
     */
    public findPosition(uid: string): Promise<AbsolutePosition> {
        return new Promise((resolve, reject) => {
            const filter: FilterQuery<any> = {
                uid,
            };
            this.findAll(filter)
                .then((objects) => {
                    if (objects.length === 0) {
                        return resolve(undefined);
                    }
                    resolve(objects.sort((a, b) => b.createdTimestamp - a.createdTimestamp)[0].getPosition());
                })
                .catch(reject);
        });
    }

    /**
     * Find the trajectory of an object from start to end date
     *
     * @param {string} uid Unique identifier of data object
     * @param {Date | number} start Start time or date
     * @param {Date | number} end End time or date
     * @returns {AbsolutePosition[]} Array of positions sorted by time
     */
    public findTrajectory(uid: string, start?: Date | number, end?: Date | number): Promise<AbsolutePosition[]> {
        return new Promise((resolve, reject) => {
            const filter: FilterQuery<any> = {
                uid,
                createdTimestamp: {
                    $lt: end ? (end instanceof Date ? end.getTime() : end) : Number.MAX_VALUE,
                    $gt: start ? (start instanceof Date ? start.getTime() : start) : -1,
                },
            };
            this.findAll(filter)
                .then((objects) => {
                    const positions: Array<AbsolutePosition> = [];
                    objects.forEach((object) => {
                        positions.push(object.getPosition());
                    });
                    resolve(positions);
                })
                .catch(reject);
        });
    }

    public appendPosition(object: DataObject): Promise<T> {
        const clone = object.clone();
        clone.createdTimestamp = clone.getPosition().timestamp;
        return this.driver.insert(
            {
                uid: clone.uid,
                timestamp: clone.createdTimestamp,
            },
            clone as T,
        );
    }
}

export interface PositionIdentifier {
    uid: string;
    timestamp: number;
}
