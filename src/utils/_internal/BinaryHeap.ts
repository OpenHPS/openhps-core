/**
 * Binary Heap Implementation
 *
 * @see {@link http://eloquentjavascript.net/appendix2.html}
 */
export class BinaryHeap<T> {
    public _content: T[] = [];
    private _scoreFn: (element: T) => number;

    constructor(scoreFn: (element: T) => number) {
        this._scoreFn = scoreFn;
    }

    public get content(): T[] {
        return this._content;
    }

    public push(element: T): void {
        // Add the new element to the end of the array.
        this._content.push(element);
        // Allow it to bubble up.
        this.bubbleUp(this._content.length - 1);
    }

    public pop(): T {
        // Store the first element so we can return it later.
        const result = this._content[0];
        // Get the element at the end of the array.
        const end = this._content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this._content.length > 0) {
            this._content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    public remove(node: T): void {
        const length = this._content.length;
        // To remove a value, we must search through the array to find
        // it.
        for (let i = 0; i < length; i++) {
            if (this._content[i] !== node) continue;
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            const end = this._content.pop();
            // If the element we popped was the one we needed to remove,
            // we're done.
            if (i === length - 1) break;
            // Otherwise, we replace the removed element with the popped
            // one, and allow it to float up or sink down as appropriate.
            this._content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    }

    public size(): number {
        return this._content.length;
    }

    public bubbleUp(n: number) {
        // Fetch the element that has to be moved.
        const element = this._content[n];
        const score = this._scoreFn(element);
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this._content[parentN];
            // If the parent has a lesser score, things are in order and we
            // are done.
            if (score >= this._scoreFn(parent)) break;

            // Otherwise, swap the parent with the current element and
            // continue.
            this._content[parentN] = element;
            this._content[n] = parent;
            n = parentN;
        }
    }

    public peek(): T {
        return this.content[0];
    }

    public sinkDown(n: number) {
        // Look up the target element and its score.
        const length = this._content.length;
        const element = this._content[n];
        const elemScore = this._scoreFn(element);

        // eslint-disable-next-line
        while (true) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) * 2;
            const child1N = child2N - 1;
            let child1Score = null;
            // This is used to store the new position of the element,
            // if any.
            let swap = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                const child1 = this._content[child1N];
                child1Score = this._scoreFn(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const child2 = this._content[child2N];
                const child2Score = this._scoreFn(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) swap = child2N;
                if (child1Score < elemScore) swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const child2 = this._content[child2N];
                const child2Score = this._scoreFn(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) swap = child2N;
            }

            // No need to swap further, we are done.
            if (swap === null) break;

            // Otherwise, swap and continue.
            this._content[n] = this._content[swap];
            this._content[swap] = element;
            n = swap;
        }
    }
}
