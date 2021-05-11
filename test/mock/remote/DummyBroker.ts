import * as EventEmitter from "events";

export class DummyBroker extends EventEmitter {
    public static instance: DummyBroker;

    constructor() {
        super();
        DummyBroker.instance = this;
    }
}
