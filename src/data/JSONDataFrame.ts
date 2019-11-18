import { DataFrame } from "./DataFrame";

export class JSONDataFrame extends DataFrame {
    private _jsonData: any;

    constructor(json: any) {
        super();
        this.parseJSON(json);
    }

    public parseJSON(json: any){
        let data = json;
        if (typeof json == "string"){
            data = JSON.parse(json);
        }
        this._jsonData = data;
        if (this.getData().object != undefined){
            
        } 
    }

    public getData() : any {
        return this._jsonData;
    }
}