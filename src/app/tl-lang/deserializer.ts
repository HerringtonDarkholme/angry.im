import {Injectable} from '@angular/core'
import {bytesToHex} from '../crypto'
import {
  Schema, MethodData, ConstructorData,
  GZIP_CTOR, VECTOR_CTOR, TRUE_CTOR, FALSE_CTOR
} from './types'

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

type InnerData = MethodData | ConstructorData

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
    if (bool === TRUE_CTOR) {
      return true
    }
    if (bool === FALSE_CTOR) {
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

  private _tryGetVector(type: string, schema: Schema): [boolean, any] {
    let vectorName = type.substr(0, 6)
    if (vectorName.toLowerCase() !== 'vector') {
      return [false, undefined]
    }

    if (vectorName === 'Vector') {
      let constructorCmp = uintToInt(this.getInt())
      // gzip
      if (constructorCmp === GZIP_CTOR) {
        throw new TypeError('unsupported for now')
        // let compressed = this.getBytes()
        // let uncompressed = gzipUncompress(compressed)
        // let newDeserializer = new Deserializer(uncompressed)
        // return newDeserializer.getObject(type, field);
      }
      if (constructorCmp !== VECTOR_CTOR) {
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
      result.push(this.getObject(itemType, schema))
    }
    return [true, result]
  }


  private _findConstructor(type: string, schema: Schema) {
    let constructorData: ConstructorData
    if (type.charAt(0) === '%') {
      // explicit bare type
      let checkType = type.substr(1)
      constructorData = _findCtorByPredicate(checkType, schema)
    } else if (isPrimitive(type)) {
      // primitive type like int128
      constructorData = _findCtorByPredicate(type, schema)
    } else {
      let constructor = this.getInt()
      let constructorCmp = uintToInt(constructor)
      if (constructorCmp === GZIP_CTOR) {
        throw new TypeError('unsupported for now')
        // let compressed = this.getBytes()
        // let uncompressed = gzipUncompress(compressed)
        // let newDeserializer = new Deserializer(uncompressed)
        // return newDeserializer.getObject(type, field);
      }
      for (let ctor of schema.constructors) {
        if (ctor.id === '' + constructorCmp) {
          constructorData = ctor
        }
      }
      if (!constructorData) {
        throw new Error('Constructor not found: ' + constructor + ' ' + this.getInt() + ' ' + this.getInt())
      }
    }
    return constructorData
  }

  private _buildResult(constructorData: ConstructorData, schema: Schema) {
    let result: any = {
      _: constructorData.predicate
    }
    for (let param of constructorData.params) {
      let paramType = param.type
      if (paramType === '#' && result.pFlags === undefined) {
        result.pFlags = {}
      }
      let isCond = paramType.indexOf('?') !== -1
      if (isCond) {
        let condType = paramType.split('?')
        let [field, bitStr] = condType[0].split('.')
        let bit = +bitStr
        if (!(result[field] & (1 << bit))) {
          continue
        }
        paramType = condType[1]
      }
      let value = this.getObject(paramType, schema)
      if (isCond && paramType === 'true') {
        result.pFlags[param.name] = value
      } else {
        result[param.name] = value
      }
    }
    return result
  }

  getObject(type: string, schema: Schema) {
    let [success, ret] = this._tryGetBase(type)
    if (success) {
      return ret
    }
    ;[success, ret] = this._tryGetVector(type, schema)
    if (success) {
      return ret
    }
    let constructorData = this._findConstructor(type, schema)

    return this._buildResult(constructorData, schema)
  }
}

function uintToInt(val) {
  if (val > 2147483647) {
    val = val - 4294967296
  }
  return val
}

function _findCtorByPredicate(type: string, schema: Schema) {
    for (let ctorData of schema.constructors) {
      if (type === ctorData.predicate) {
        return ctorData
      }
    }
    throw new Error('Cannot find constructorData for predicate: ' + type)
}

function isPrimitive(typeName: string) {
    //typeName example: auth.ResPQ
    typeName = typeName.slice(typeName.lastIndexOf('.') + 1);
    return typeName.charAt(0) !== typeName.charAt(0).toUpperCase();
}
