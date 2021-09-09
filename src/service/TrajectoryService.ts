import { Trajectory } from '../data/position';
import { DataObject } from '../data/object/DataObject';
import { DataService } from './DataService';
import { DataServiceDriver, DataServiceOptions } from './DataServiceDriver';
import { Model } from '../Model';

/**
 * A trajectory service stores the position of a data object
 * in a continuous trajectory.
 */
export class TrajectoryService<T extends Trajectory = Trajectory> extends DataService<string, T> {
    public model: Model;
    protected options: TrajectoryServiceOptions;

    constructor(dataServiceDriver?: DataServiceDriver<string, T>, options?: TrajectoryServiceOptions) {
        super(dataServiceDriver as any);
        this.options = options || {};
        this.options.dataService = this.options.dataService || DataObject.name;
        this.driver.once('ready', this._bindService.bind(this));
    }

    private _bindService(): Promise<void> {
        return new Promise((resolve) => {
            this.model.findDataService(this.options.dataService).on('insert', (_, object) => {
                this.appendPosition(object);
            });
            resolve();
        });
    }

    /**
     * Find the latest trajectory
     *
     * @param {DataObject | string} object Data object to get trajectories for
     * @returns {Promise<Trajectory>} Trajectory promise if found
     */
    public findCurrentTrajectory(object: DataObject | string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.findOne({
                objectUID: object instanceof DataObject ? object.uid : object,
            })
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Find the trajectory of an object from start to end date
     *
     * @param {DataObject | string} object Data object to get trajectory for
     * @param {Date | number} start Start time or date
     * @param {Date | number} end End time or date
     * @returns {Trajectory} Trajectory match
     */
    public findTrajectoryByRange(object: DataObject | string, start?: Date | number, end?: Date | number): Promise<T> {
        return new Promise((resolve, reject) => {
            this.findOne({
                objectUID: object instanceof DataObject ? object.uid : object,
                positions: {
                    timestamp: {
                        $lte: end ? (end instanceof Date ? end.getTime() : end) : Number.MAX_VALUE,
                        $gte: start ? (start instanceof Date ? start.getTime() : start) : -1,
                    },
                },
            })
                .then((trajectory) => {
                    resolve(trajectory);
                })
                .catch(reject);
        });
    }

    /**
     * Find all trajectories of an object
     *
     * @param {DataObject | string} object Data object to get trajectories for
     * @returns {Promise<string[]>} List of trajectory UIDs
     */
    public findTrajectories(object: DataObject | string): Promise<string[]> {
        return new Promise((resolve) => {
            this.findAll({
                objectUID: object instanceof DataObject ? object.uid : object,
            }).then((trajectories) => {
                resolve(trajectories.map((trajectory) => trajectory.uid));
            });
        });
    }

    /**
     * Append a position to the trajectory service
     *
     * @param {DataObject} object Data object to store
     * @param {string} uid Trajectory uid
     * @returns {Promise<Trajectory>} Stored trajectory
     */
    public appendPosition(object: DataObject, uid?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            const position = object.getPosition();
            if (position) {
                Promise.resolve(uid ? this.findByUID(uid) : this.findCurrentTrajectory(object))
                    .then((trajectory) => {
                        if (!trajectory) {
                            trajectory = new this.driver.dataType();
                            trajectory.objectUID = object.uid;
                        }
                        trajectory.positions.push(object.position);
                        return this.insert(trajectory.uid, trajectory);
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                return reject();
            }
        });
    }
}

export interface TrajectoryServiceOptions extends DataServiceOptions {
    /**
     * Dataservice to fetch stored data objects
     */
    dataService?: string;
}
