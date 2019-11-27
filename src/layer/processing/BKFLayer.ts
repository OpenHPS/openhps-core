import { NoiseFilterLayer } from "./NoiseFilterLayer";
import { DataObject } from "../../data";

/**
 * Basic Kalman Filter for one dimensional data.
 */
export abstract class BKFLayer extends NoiseFilterLayer<any, any> {
    public abstract processObject(object: DataObject, layerData: any): Promise<{object: DataObject, layerData: any}>;

    public abstract predictObject(object: DataObject, layerData: any): Promise<{object: DataObject, layerData: any}>;
}
