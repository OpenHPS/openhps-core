import { Service } from "../../../src";

export class TimeConsumingService extends Service {
    private _computations: number;
    constructor(computations: number) {
        super();
        this._computations = computations;
    }

    public someAction(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.listPrimes(this._computations);
            resolve();
        });
    }

    private listPrimes(nPrimes: number) {
        var primes = [];
        for (let n = 2; nPrimes > 0;  n++ ) {
            if(this.isPrime(n)) {
                primes.push(n);
                --nPrimes;
            }
        }
        return primes;
    }

    private isPrime(n: number) {
        var max = Math.sqrt(n);
        for (let i = 2;  i <= max;  i++ ) {
            if( n % i === 0 )
                return false;
        }
        return true;
    }
}
