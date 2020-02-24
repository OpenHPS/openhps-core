import { DataFrame, DataObject, ListSourceNode } from "../../../../src";
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csv-parser';

export class CSVDataSource<Out extends DataFrame> extends ListSourceNode<Out> {
    private _rowCallback: (row: any) => Out;
    private _file: string;
    
    constructor(file: string, rowCallback: (row: any) => Out) {
        super([], new DataObject(path.basename(file)));
        this._rowCallback = rowCallback;
        this._file = file;

        this.once("build", this._initCSV.bind(this));
    }

    private _initCSV(_?: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const inputData = new Array();
            fs.createReadStream(this._file)
            .pipe(csv())
            .on('data', (row: any) => {
                const frame = this._rowCallback(row);
                if (frame.source === undefined) {
                    frame.source = this.source;
                }
                inputData.push(frame);   
            })
            .on('end', () => {
                this.inputData = inputData;
                resolve();
            });
        });
    }

    public reset(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.inputData = [];
            this._initCSV().then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        })
    }
    
}
