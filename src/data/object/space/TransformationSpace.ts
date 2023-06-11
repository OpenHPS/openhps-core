import { DataService } from '../../../service/DataService';
import { AbsolutePosition } from '../../position/AbsolutePosition';

/**
 * A transformation space transforms absolute positions to another (global) space.
 */
export interface TransformationSpace {
    /**
     * Unique uuidv4 identifier of the transformation space
     */
    uid: string;
    /**
     * Set the parent space
     *
     * @param {TransformationSpace} space Parent space
     */
    parent: TransformationSpace;

    /**
     * Update parent reference spaces
     *
     * @param {DataService} service Service to use for updating
     * @returns {Promise<void>} Update promise
     */
    update(service: DataService<any, this>): Promise<void>;

    /**
     * Transform a position
     *
     * @param {AbsolutePosition} position Position to transform
     * @param {SpaceTransformationOptions} [options] Transformation options
     * @returns {AbsolutePosition} Transformed position
     */
    transform<In extends AbsolutePosition, Out extends AbsolutePosition = In>(
        position: In,
        options?: SpaceTransformationOptions,
    ): Out;
}

export interface SpaceTransformationOptions {
    /**
     * Perform an inverse transformation
     */
    inverse?: boolean;
}
