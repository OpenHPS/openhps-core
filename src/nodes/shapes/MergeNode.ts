import { DataFrame } from "../../data";
import { Node } from "../../Node";
import { GraphPushOptions, GraphPullOptions } from "../../graph";

/**
 * Data frame merge node
 * 
 * ## Usage
 * Merging is done by determining the incoming edges
 */
export class MergeNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises = new Array();
            const frameService = this.getDataFrameService(data);
            if (frameService !== null && frameService !== undefined) { 
                // Update the frame
                servicePromises.push(frameService.insert(data.uid, data));
            }

            Promise.all(servicePromises).then(_1 => {
                // Validate if the data frame should be merged and pushed

                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (options.filter === undefined) {
                return reject(`Merge node ${this.uid} requires pull filter but none is provided!`);
            }

            const objectFilter = new Array();
            if (options.filter.object !== undefined) {
                
            } 
            
            const frameFilter = new Array();
            if (options.filter.frame !== undefined) {
                
            }
        });
    }

}
