import { StationaryObject } from "../../../src";

export class AccessPointObject extends StationaryObject {
    private _macAddress: string;

    constructor() {
        super("");
    }
    
    /**
     * Get MAC address of access point
     */
    public getMacAddress() : string {
        return this._macAddress;
    }

    /**
     * Set MAC address of access point
     * @param macAddress MAC address
     */
    public setMacAddress(macAddress: string) : void {
        this._macAddress = macAddress;
    }
}