import { SerializableMember, SerializableObject } from './decorators';
import { v4 as uuidv4 } from 'uuid';

const UUID_PADDING = '-0000-1000-8000-00805f9b34fb';

/**
 * Unique identifier
 */
@SerializableObject()
export class UUID {
    @SerializableMember({
        name: 'value',
    })
    private _raw: Uint8Array;

    private constructor(buffer?: Uint8Array) {
        this._raw = buffer;
    }

    static generate(): UUID {
        const uuidString = uuidv4();
        return UUID.fromString(uuidString);
    }

    static fromBuffer(buffer: Uint8Array): UUID {
        return new this(buffer);
    }

    static fromString(uuid: string): UUID {
        const hexArray: number[] = uuid
            .replace(UUID_PADDING, '')
            .replace(/-/g, '')
            .split(/(..)/)
            .filter((a) => {
                return a !== '';
            })
            .map((hex) => {
                return Number(`0x${hex}`);
            });
        if (hexArray.includes(NaN)) {
            return undefined;
        }
        let array = Uint8Array.from(hexArray);
        if (uuid.startsWith('0000')) {
            array = array.slice(2);
        }
        return new this(array);
    }

    toBuffer(): Uint8Array {
        return this._raw;
    }

    toString(): string {
        const bytes = [];
        for (const [, value] of this._raw.entries()) {
            bytes.push(value);
        }
        if (this._raw.byteLength === 2) {
            // 16 bit
            return (
                '0000' +
                bytes
                    .map((byte: number) => {
                        return byte.toString(16).padStart(2, '0');
                    })
                    .join('') +
                UUID_PADDING
            );
        } else if (this._raw.byteLength === 4) {
            // 32 bit
            return (
                bytes
                    .map((byte: number) => {
                        return byte.toString(16).padStart(2, '0');
                    })
                    .join('') + UUID_PADDING
            );
        } else {
            // 128 bit
            const hex = bytes.map((byte: number) => {
                return byte.toString(16).padStart(2, '0');
            });
            return (
                hex.splice(0, 4).join('') +
                '-' +
                hex.splice(0, 2).join('') +
                '-' +
                hex.splice(0, 2).join('') +
                '-' +
                hex.splice(0, 2).join('') +
                '-' +
                hex.join('')
            );
        }
    }
}
