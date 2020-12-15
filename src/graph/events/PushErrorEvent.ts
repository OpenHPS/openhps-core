import { PushEvent } from './PushEvent';

/**
 * Push error event
 */
export interface PushErrorEvent extends PushEvent {
    /**
     * Error that is triggered
     */
    error: Error;
}
