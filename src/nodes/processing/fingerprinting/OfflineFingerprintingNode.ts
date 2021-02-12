import { DataFrame, DataObject } from '../../../data';
import { FingerprintingNode } from './FingerprintingNode';

export class OfflineFingerprintingNode<InOut extends DataFrame> extends FingerprintingNode<InOut> {
    protected onlineFingerprinting(): Promise<DataObject> {
        throw new Error(`Offline fingerprinting node can not perform reverse fingerprinting!`);
    }
}
