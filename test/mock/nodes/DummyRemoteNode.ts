import { DataFrame, RemoteNode } from "../../../src";
import { DummyServer } from "../remote/DummyServer";

export class DummyRemoteNode<In extends DataFrame, Out extends DataFrame> extends RemoteNode<In, Out, DummyServer> {

    constructor() {
        super({
            service: DummyServer
        });
    }
    
}
