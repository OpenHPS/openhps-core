import { CallbackNode, CallbackSinkNode, DataFrame, DataObject, KeyValueDataService, MemoryDataService, Model, ModelBuilder, RemoteNode, RemoteServiceProxy, RemoteSinkNode, RemoteSourceNode } from '../../../src';
import { expect } from 'chai';
import 'mocha';
import { DummyServer } from '../../mock/remote/DummyServer';
import { DummyClient } from '../../mock/remote/DummyClient';
import { DummyBroker } from '../../mock/remote/DummyBroker';

describe('RemoteService', () => {
    describe('service', () => {
        let server: Model;
        let client: Model;
        let server_sink: CallbackSinkNode<any> = new CallbackSinkNode();
        let client_sink: CallbackSinkNode<any> = new CallbackSinkNode();
    
        before(async () => {
            new DummyBroker();
            server = await ModelBuilder.create()
                .addService(new DummyServer())
                .addService(new KeyValueDataService("test123", new MemoryDataService(String, {
                    serialize: (d) => d,
                    deserialize: (d) => d
                })))
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
                }), server_sink).build();
            client = await ModelBuilder.create()
                .addService(new DummyClient())
                .addService(new KeyValueDataService("test123"), new RemoteServiceProxy({
                    service: DummyClient,
                    uid: "test123"
                }))
                .from()
                .to(new RemoteSinkNode({
                    uid: "/api/v1/uid1",
                    service: DummyClient
                }), client_sink)
                .build();
        });

        it('should forward methods', async () => {
            expect(client.findDataService("test123")).to.not.be.undefined;
            await (client.findDataService("test123") as KeyValueDataService).setValue("abc", "123");
            expect(await (server.findDataService("test123") as KeyValueDataService).getValue("abc")).to.equal("123");
            expect(await (client.findDataService("test123") as KeyValueDataService).getValue("abc")).to.equal("123");
        });
    });
    
    describe('source and sink', () => {
        let server: Model;
        let client: Model;
        let server_sink: CallbackSinkNode<any> = new CallbackSinkNode();
        let client_sink: CallbackSinkNode<any> = new CallbackSinkNode();
    
        before(async () => {
            new DummyBroker();
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
                }), server_sink).build();
            client = await ModelBuilder.create()
                .addService(new DummyClient())
                .from()
                .to(new RemoteSinkNode({
                    uid: "/api/v1/uid1",
                    service: DummyClient
                }), client_sink)
                .build();
        });
    
        it('should create additional nodes for inlet and outlets', () => {
            expect(client.findNodeByUID("/api/v1/uid1-sink")).to.not.be.undefined;
            expect(server.findNodeByUID("/api/v1/uid2-sink")).to.not.be.undefined;
            expect(server.findNodeByUID("/api/v1/uid1-source")).to.not.be.undefined;
            expect(client.findNodeByUID("/api/v1/uid1")).to.not.be.undefined;
            expect(server.findNodeByUID("/api/v1/uid2")).to.not.be.undefined;
            expect(server.findNodeByUID("/api/v1/uid1")).to.not.be.undefined;
        });

        it('should link a sink to a remote source', (done) => {
            server_sink.callback = (_) => {
                done();
            };
            client.push(new DataFrame());
        });
    });

    describe('processing node', () => {
        let server: Model;
        let client: Model;
        let server_sink: CallbackSinkNode<any> = new CallbackSinkNode();
        let client_sink: CallbackSinkNode<any> = new CallbackSinkNode();
    
        before(async () => {
            new DummyBroker();
            server = await ModelBuilder.create()
                .addService(new DummyServer())
                .from(new RemoteSourceNode({
                    uid: "/api/v1/uid1",
                    service: "DummyServer"
                }))
                .via(new CallbackNode(frame => {
                    // Process
                    frame.addObject(new DataObject("abc"));
                }))
                .to(new RemoteSinkNode({
                    uid: "/api/v1/uid2",
                    service: "DummyServer"
                }), server_sink).build();
            client = await ModelBuilder.create()
                .addService(new DummyClient())
                .from()
                .via(new RemoteNode({
                    uid: "/api/v1/uid1",
                    service: "DummyClient"
                }))
                .via(new RemoteNode({
                    uid: "/api/v1/uid2",
                    service: "DummyClient"
                }))
                .to(client_sink)
                .build();
        });
    
        it('should create additional nodes for inlet and outlets', () => {
            expect(server.findNodeByUID("/api/v1/uid2-sink")).to.not.be.undefined;
            expect(server.findNodeByUID("/api/v1/uid1-source")).to.not.be.undefined;
            expect(server.findNodeByUID("/api/v1/uid2")).to.not.be.undefined;
            expect(server.findNodeByUID("/api/v1/uid1")).to.not.be.undefined;
        });

        it('should implement a processing node', (done) => {
            client_sink.callback = (frame: DataFrame) => {
                expect(frame.getObjectByUID("abc")).to.not.be.undefined;
                done();
            };
            client.push(new DataFrame());
        });
    });

    describe('error forwarding', () => {
        let server: Model;
        let client: Model;
        let server_sink: CallbackSinkNode<any> = new CallbackSinkNode();
        let client_sink: CallbackSinkNode<any> = new CallbackSinkNode();
    
        before(async () => {
            new DummyBroker();
            server = await ModelBuilder.create()
                .addService(new DummyServer())
                .from(new RemoteSourceNode({
                    uid: "/api/v1/uid1",
                    service: "DummyServer"
                }))
                .via(new CallbackNode(frame => {
                    // Process
                    throw new Error('Test');
                }))
                .to(new RemoteSinkNode({
                    uid: "/api/v1/uid2",
                    service: "DummyServer"
                }), server_sink).build();
            client = await ModelBuilder.create()
                .addService(new DummyClient())
                .from()
                .to(new RemoteSinkNode({
                    uid: "/api/v1/uid1",
                    service: "DummyClient"
                }), client_sink)
                .build();
        });
    
        it('should forward an error', (done) => {
            client.once('error', error => {
                done();
            });
            client.push(new DataFrame());
        });

    });
});
