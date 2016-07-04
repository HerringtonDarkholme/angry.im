import {Injectable} from '@angular/core'
import {hexToBytes} from '../crypto'
import {
  Schema, MethodData, ConstructorData,
  VECTOR_CTOR, TRUE_CTOR, FALSE_CTOR
} from './types'

const SUCCESS = true
const BASE_TYPES = {
  '#'      : 'putInt',
  'int'    : 'putInt',
  'long'   : 'putLong',
  'int128' : 'putInt128',
  'int256' : 'putInt256',
  'string' : 'putString',
  'bytes'  : 'putBytes',
  'double' : 'putDouble',
  'Bool'   : 'putBool',
}
type InnerData = MethodData | ConstructorData

@Injectable()
export class Serializer {
  bytes: Uint8Array
  buffer: ArrayBuffer
  ints: Uint32Array
  // in bytes
  capacity: number
  offset: number

  constructor(capacity = 2048) {
    this.offset = 0
    this.capacity = capacity
    this.createBuffer()
  }

  createBuffer() {
    let capacity = this.capacity
    this.buffer = new ArrayBuffer(capacity)
    this.bytes = new Uint8Array(this.buffer)
    this.ints = new Int32Array(this.buffer)
  }

  getBytes() {
    let buffer = new ArrayBuffer(this.offset)
    let bytes = new Uint8Array(buffer)
    bytes.set(this.bytes.subarray(0, this.offset))
    return bytes
  }

  ensureSize(needBytes: number) {
    needBytes = needBytes | 0
    if (this.offset + needBytes < this.capacity) {
      return
    }
    this.capacity = Math.max(this.capacity * 2, this.offset + needBytes + 16)
    let prevBytes = this.bytes
    this.createBuffer()
    this.bytes.set(prevBytes)
  }

  // Uint8Array is little endian
  putInt(i: number) {
    i = i | 0
    this.ensureSize(4)
    this.ints[this.offset / 4] = i
    this.offset += 4
  }

  putDouble(d: number) {
    let buffer = new ArrayBuffer(8)
    let intView = new Int32Array(buffer)
    let doubleView = new Float64Array(buffer)
    doubleView[0] = d
    this.putInt(intView[0])
    this.putInt(intView[1])
  }

  putBytes(bytes: Uint8Array) {
    let len = bytes.length
    this.ensureSize(len + 8)

    // adding bytes length at the beginning
    if (len <= 253) {
      this.bytes[this.offset++] = len
    } else {
      this.bytes[this.offset++] = 254
      this.bytes[this.offset++] = len & 0xff
      this.bytes[this.offset++] = (len & 0xff00) >> 8
      this.bytes[this.offset++] = (len & 0xff0000) >> 16
    }

    this.bytes.set(bytes, this.offset)
    this.offset += len

    // padding
    while (this.offset % 4) {
      this.bytes[this.offset++] = 0
    }
  }

  putRawBytes(bytes: Uint8Array) {
    let len = bytes.length
    this.ensureSize(len)
    this.bytes.set(bytes, this.offset)
    this.offset += len
  }

  putString(str: string) {
    // the now DEPRECATED unescape will convert str to ascii
    str = unescape(encodeURIComponent(str))
    let len = str.length
    let bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = str.charCodeAt(i)
    }
    this.putBytes(bytes)
  }

  private _putBigIntN(bigIntHex: string, byteLength: number) {
    let bytes = hexToBytes(bigIntHex)
    this.ensureSize(byteLength)
    let len = Math.min(bytes.length, byteLength)
    let offset = this.offset
    for (let i = 0; i < len; i++) {
      this.bytes[offset + i] = bytes[len - i - 1]
    }
    this.offset += byteLength
  }

  putLong(longHex: string) {
    this._putBigIntN(longHex, 8)
  }

  putInt128(hex: string) {
    this._putBigIntN(hex, 16)
  }

  putInt256(hex: string) {
    this._putBigIntN(hex, 32)
  }

  putBool(bool: boolean) {
    if (bool) {
      this.putInt(TRUE_CTOR)
    } else {
      this.putInt(FALSE_CTOR)
    }
  }

  private _tryPutBase(obj: any, type: string): boolean {
    if (type in BASE_TYPES) {
      this[BASE_TYPES[type]](obj)
      return SUCCESS
    }
    if (type === 'true') return SUCCESS
    return false
  }

  private _tryPutVector(objs: any[], type: string, schema: Schema): boolean {
    let vectorName = type.substr(0, 6)
    if (vectorName.toLowerCase() !== 'vector') {
      return false
    }
    // capitalized Vector needs put constructor
    if (vectorName === 'Vector') {
      this.putInt(VECTOR_CTOR)
    }
    // put length
    this.putInt(objs.length)
    // for "Vector<itemType>"
    let itemType = type.substr(7, type.length - 8)
    for (let obj of objs) {
      this.putObject(obj, itemType, schema)
    }
    return SUCCESS
  }

  // put each obj in constructorData/methodData
  private _putInner(obj: any, innerData: InnerData, schema: Schema) {
    for (let param of innerData.params) {
      let paramType = param.type
      if (paramType.indexOf('?') !== -1) {
        // conditional fields (e.g. flags.2?MessageFwdHeader)
        let condType = paramType.split('?')
        let [field, bitStr] = condType[0].split('.')
        let bit = +bitStr
        if (!(obj[field] & (1 << bit))) {
          continue
        }
        paramType = condType[1]
      }

      this.putObject(obj[param.name], paramType, schema)
    }
  }

  putObject(obj: any, type: string, schema: Schema) {
    if (this._tryPutBase(obj, type) === SUCCESS) {
      return
    }
    if (this._tryPutVector(obj, type, schema) === SUCCESS) {
      return
    }
    let predicate = obj['_']
    let constructorData: ConstructorData
    // find constructorData
    for (let ctorData of schema.constructors) {
      if (ctorData.predicate === predicate) {
        constructorData = ctorData
        break
      }
    }
    // if type starts with %, or predicate === type
    // then type is bare
    let isBare = type.charAt(0) === '%'
    if (isBare) {
      type = type.substr(1)
    }
    // primitive type
    if (predicate === type) {
      isBare = true
    }
    // write ctorid for boxed type
    if (!isBare) {
      this.putInt(intToUint(constructorData.id))
    }
    this._putInner(obj, constructorData, schema)
  }

  putMethod(method: string, params: any, schema: Schema) {
    let methodData: MethodData
    for (let md of schema.methods) {
      if (md.method === method) {
        methodData = md
        break
      }
    }
    this.putInt(intToUint(methodData.id))
    this._putInner(params, methodData, schema)
  }
}

function intToUint (val: string): number {
  let num = parseInt(val, 10)
  if (num < 0) {
    num = num + 4294967296
  }
  return num
}
