import {Injectable} from '@angular/core'
import {bytesToHex} from '../crypto'

const SUCCESS = true
export const BASE_TYPES = {
  '#'      : 'getInt',
  'int'    : 'getInt',
  'long'   : 'getLong',
  'int128' : 'getInt128',
  'int256' : 'getInt256',
  'string' : 'getString',
  'bytes'  : 'getBytes',
  'double' : 'getDouble',
  'Bool'   : 'getBool',
}

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

  getBool() {
    let bool = this.getInt()
    if (bool === 0x997275b5) {
      return true
    }
    if (bool === 0xbc799737) {
      return false
    }
    throw new TypeError('invalid bool value')
  }

  private _tryGetBase(type: string): [boolean, any] {
    if (type in BASE_TYPES) {
      let ret = this[BASE_TYPES[type]]()
      return [true, ret]
    }
    if (type === 'true') {
      return [true, true]
    }
    return [false, undefined]
  }

  private _tryGetVector(type: string, schema): [boolean, any] {
    let vectorName = type.substr(0, 6)
    if (vectorName.toLowerCase() !== 'vector') {
      return [false, undefined]
    }

    if (vectorName === 'Vector') {
      let constructorCmp = uintToInt(this.getInt())
      // gzip
      if (constructorCmp === 0x3072cfa1) {
        throw new TypeError('unsupported for now')
        // let compressed = this.getBytes()
        // let uncompressed = gzipUncompress(compressed)
        // let newDeserializer = new Deserializer(uncompressed)
        // return newDeserializer.getObject(type, field);
      }
      if (constructorCmp !== 0x1cb5c415) {
        throw new TypeError('invalid vector constructor')
      }
    }
    let length = this.getInt()
    let result = []
    if (length <= 0) {
      return [true, result]
    }
    let itemType = type.substr(7, type.length - 8)
    for (let i = 0; i < length; i++) {
      result.push(this.getObject(type, schema))
    }
    return [true, result]
  }

  getObject(type: string, schema) {
    let [success, ret] = this._tryGetBase(type)
    if (success) {
      return ret
    }
    ;[success, ret] = this._tryGetVector(type, schema)
    if (success) {
      return ret
    }
    // todo
    throw new Error('TODO')
  }
}

function uintToInt(val) {
  if (val > 2147483647) {
    val = val - 4294967296
  }
  return val
}
