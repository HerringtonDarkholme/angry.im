import {Injectable} from '@angular/core'
import {bytesToHex} from '../crypto'

@Injectable()
export class Deserializer {

  ints: Uint32Array
  bytes: Uint8Array
  buffer: ArrayBuffer

  offset: number

  constructor(bytes: Uint8Array) {
    let buffer = new ArrayBuffer(bytes.length)
    let newBytes = new Uint8Array(buffer)
    newBytes.set(bytes)
    this.buffer = buffer
    this.offset = 0
    this.ints = new Uint32Array(buffer)
    this.bytes = new Uint8Array(buffer)
  }

  getInt() {
    let i = this.ints[this.offset / 4]
    this.offset += 4
    return i
  }

  getDouble() {
    let buffer = new ArrayBuffer(8)
    let ints = new Uint32Array(buffer)
    let doubles = new Float64Array(buffer)

    ints[0] = this.getInt()
    ints[1] = this.getInt()
    return doubles[0]
  }

  getBytes() {
    // read length
    let len = this.bytes[this.offset++]
    if (len === 254) {
      len = this.bytes[this.offset++] |
        (this.bytes[this.offset++] << 8) |
        (this.bytes[this.offset++] << 16)
    }

    let bytes = this.bytes.subarray(this.offset, this.offset + len)
    this.offset += len
    // padding
    while (this.offset % 4) {
      this.offset++
    }
    return bytes
  }

  getRawBytes(len: number) {
    let bytes = new Uint8Array(len)
    bytes.set(this.bytes.subarray(this.offset, this.offset + len))
    this.offset += len
    return bytes
  }

  getString() {
    let bytes = this.getBytes()
    let str = ''
    for (let i = 0, l = bytes.length; i < l; i++) {
      str += String.fromCharCode(bytes[i])
    }
    return decodeURIComponent(escape(str))
  }

  private _getBigIntN(byteLength: number): string {
    if (byteLength % 4) {
      throw new Error('Deserializer: invalid length! ' + byteLength)
    }
    let bytes = new Uint8Array(byteLength)
    let i = byteLength
    while (i) {
      bytes[--i] = this.bytes[this.offset++]
    }
    return bytesToHex(bytes)
  }

  getLong() {
    return this._getBigIntN(8)
  }

  getInt128() {
    return this._getBigIntN(16)
  }

  getInt256() {
    return this._getBigIntN(32)
  }
}
