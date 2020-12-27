import { DataObject } from '../../data';
import { DataFrame } from '../../data/DataFrame';
import { PullOptions } from '../../graph';
import { SourceNode, SourceNodeOptions } from '../SourceNode';

export class HistorySourceNode<Out extends DataFrame> extends SourceNode<Out> {
    constructor(options?: SourceNodeOptions) {
        super(options);
    }

    public onPull(options: PullOptions = { requestedObjects: [] }): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            const service = this.model.findDataService(DataObject);
            const requestPromises: Array<Promise<DataObject>> = [];
            options.requestedObjects.forEach((uid) => {
                requestPromises.push(
                    new Promise((resolve) => {
                        service
                            .findByUID(uid)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch(() => {
                                // Ignore
                                resolve(undefined);
                            });
                    }),
                );
            });

            // Complete service requests
            Promise.all(requestPromises)
                .then((objects) => {
                    // Create a new dataframe from these objects
                    const frame = new DataFrame(this.source);
                    objects.forEach((object) => {
                        if (object) {
                            frame.addObject(object);
                        }
                    });
                    resolve(frame as Out);
                })
                .catch(reject);
        });
    }
}
