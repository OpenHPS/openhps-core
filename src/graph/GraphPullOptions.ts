import 'reflect-metadata';
import { GraphOptions } from "./GraphOptions";
import { SerializableObject, SerializableMember, DataFrame } from '../data';

@SerializableObject()
export class GraphPullOptions extends GraphOptions {
    /**
     * Pull filter
     */
    @SerializableMember()
    public filter?: {
        frame?: {
            uid?: string,
            source?: string,
            type?: new () => any
        },
        object?: {
            uid: string
        }
    };
    /**
     * Pull timeout in miliseconds
     */
    public timeout: number = -1;
}
