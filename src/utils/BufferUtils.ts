/**
 * Buffer to Hex string
 * @param {Uint8Array} buffer Buffer
 * @returns {string} Hex string
 */
function toHexString(buffer: Uint8Array): string {
    if (!buffer) {
        return undefined;
    }
    return buffer.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

/**
 * Hex string to Buffer
 * @param {string} bufferString Hex string
 * @returns {Uint8Array} Buffer
 */
function fromHexString(bufferString: string): Uint8Array {
    if (!bufferString) {
        return undefined;
    }
    return Uint8Array.from(bufferString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}
/**
 *
 * @param {ArrayBuffer} a Array buffer to compare
 * @param {ArrayBuffer} b Array buffer to compare
 * @returns {boolean} Equals
 */
function arrayBuffersAreEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
    return dataViewsAreEqual(new DataView(a), new DataView(b));
}

/**
 *
 * @param {DataView} a Data view to compare
 * @param {DataView} b Data view to compare
 * @returns {boolean} Equals
 */
function dataViewsAreEqual(a: DataView, b: DataView): boolean {
    if (a.byteLength !== b.byteLength) return false;
    for (let i = 0; i < a.byteLength; i++) {
        if (a.getUint8(i) !== b.getUint8(i)) return false;
    }
    return true;
}

/**
 *
 * @param {...Uint8Array[]} buffers Buffers to concat
 * @returns {Uint8Array} Concatenated buffer
 */
function concatBuffer(...buffers: Uint8Array[]): Uint8Array {
    const result = new Uint8Array(buffers.map((b) => b.byteLength).reduce((a, b) => a + b));
    buffers.forEach((buffer, idx) => {
        result.set(buffer, idx > 0 ? buffers[idx - 1].byteLength : 0);
    });
    return result;
}

export const BufferUtils = {
    toHexString,
    fromHexString,
    arrayBuffersAreEqual,
    concatBuffer,
    dataViewsAreEqual,
};
