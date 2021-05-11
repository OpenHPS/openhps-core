import { CallbackNode, CallbackSinkNode, Model, ModelBuilder, RemoteSinkNode, RemoteSourceNode } from '../../../src';
import { expect } from 'chai';
import 'mocha';
import { DummyServer } from '../../mock/remote/DummyServer';
import { DummyClient } from '../../mock/remote/DummyClient';

describe('RemoteNodeService', () => {
    let server: Model;
    let client: Model;
    let server_sink: CallbackSinkNode<any>;
    let client_sink: CallbackSinkNode<any>;

    before(async () => {
        server = await ModelBuilder.create()
            .addService(new DummyServer())
            .from(new RemoteSourceNode({
                uid: "/api/v1/uid1",
                service: "DummyServer"
            }))
            .via(new CallbackNode(frame => {
                // Process
            }))
            .to(new RemoteSinkNode({
                uid: "/api/v1/uid2",
                service: "DummyServer"
            })).build();
        client = await ModelBuilder.create()
            .addService(new DummyClient())
            .from()
            .to(new RemoteSinkNode({
                uid: "/api/v1/uid1",
                service: "DummyClient"
            }))
            .build();
    });

});
