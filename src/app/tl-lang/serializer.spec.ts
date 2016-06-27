import {
  it,
  inject,
  beforeEachProviders
} from '@angular/core/testing'

import {Serializer} from './serializer'
import {bytesToHex} from '../crypto'

describe('serializer', () => {
  it('should have capacity', () => {
    let s = new Serializer(512)
    expect(s.capacity).toBe(512)
    expect(s.bytes.length).toBe(512)
    s.ensureSize(1000)
    expect(s.capacity).toBe(1024)
    expect(s.bytes.length).toBe(1024)
  })

  it('should store long in little endian', () => {
    let s = new Serializer()
    s.putLong('51e57ac42770964a')
    expect(s.bytes[0]).toBe(parseInt('4A', 16))
    expect(s.bytes[1]).toBe(parseInt('96', 16))
    expect(s.bytes[2]).toBe(parseInt('70', 16))
    expect(s.bytes[3]).toBe(parseInt('27', 16))
    expect(s.bytes[4]).toBe(parseInt('C4', 16))
    expect(s.bytes[5]).toBe(parseInt('7A', 16))
    expect(s.bytes[6]).toBe(parseInt('E5', 16))
    expect(s.bytes[7]).toBe(parseInt('51', 16))
  })

  it('should pad 0', () => {
    let s = new Serializer()
    s.putLong('7ac42770964a')
    expect(s.bytes[0]).toBe(parseInt('4A', 16))
    expect(s.bytes[1]).toBe(parseInt('96', 16))
    expect(s.bytes[2]).toBe(parseInt('70', 16))
    expect(s.bytes[3]).toBe(parseInt('27', 16))
    expect(s.bytes[4]).toBe(parseInt('C4', 16))
    expect(s.bytes[5]).toBe(parseInt('7A', 16))
    expect(s.bytes[6]).toBe(parseInt('00', 16))
    expect(s.bytes[7]).toBe(parseInt('00', 16))
  })

  it('should store string', () => {
    let s = new Serializer()
    s.putString('Lorem ipsum dolor sit amet, consectetur adipisci elit, ' +
    'sed eiusmod tempor incidunt ut labore et dolore magna aliqua.')
    let bytes = s.getBytes()
    expect(bytes.length).toBe(120)
    expect(bytesToHex(bytes)).toBe(
      '744c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6' +
      'e736563746574757220616469706973636920656c69742c2073656420656975736d6f642074656d706f7220696e6369647' +
      '56e74207574206c61626f726520657420646f6c6f7265206d61676e6120616c697175612e000000'
    )
  })

  it('should store utf8 string', () => {
    let s = new Serializer()
    s.putString('上海、蓬莱、フランス、オランダ、チベット、京都、ロンドン、ロシア、オルレアン')
    let bytes = s.getBytes()
    expect(bytes.length).toBe(116)
    expect(bytesToHex(bytes)).toBe(
      '72e4b88ae6b5b7e38081e893ace88eb1e38081e38395e383a9e383b3e382b9e38081e382aae383a9e383b3e' +
      '38380e38081e38381e38399e38383e38388e38081e4baace983bde38081e383ade383b3e38389e383b3e380' +
      '81e383ade382b7e382a2e38081e382aae383abe383ace382a2e383b300')
  })
})
