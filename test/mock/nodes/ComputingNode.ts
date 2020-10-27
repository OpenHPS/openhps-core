import { DataFrame, DataObject, DataSerializer, Node } from "../../../src";

export class ComputingNode extends Node<DataFrame, DataFrame> {
    private _computations: number;

    constructor(computations: number = 10) {
        super();
        this._computations = computations;
        this.on('push', this.onPush.bind(this));
    }
    
    public onPush(frame: DataFrame): Promise<void> {
        return new Promise((resolve, reject) => {
            this.listPrimes(this._computations);
            const pushPromises = new Array();
            this.outputNodes.forEach(node => {
                pushPromises.push(node.push(frame));
            });
            Promise.all(pushPromises).then(() => {
                resolve();
            });
        });
    }

    private listPrimes(nPrimes: number) {
        var primes = [];
        for( var n = 2;  nPrimes > 0;  n++ ) {
            if(this.isPrime(n)) {
                primes.push(n);
                --nPrimes;
            }
        }
        return primes;
    }
    
    private isPrime(n: number) {
        var max = Math.sqrt(n);
        for( var i = 2;  i <= max;  i++ ) {
            if( n % i === 0 )
                return false;
        }
        return true;
    }

}
