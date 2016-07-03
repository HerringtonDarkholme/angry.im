import {
  it
} from '@angular/core/testing'
import {Deserializer} from './deserializer'
import {hexToBytes} from '../crypto'


describe('deserializer', () => {
  it('should get long from little endian', () => {
    let bytes = new Uint8Array(8)
    bytes[0] = parseInt('4A', 16)
    bytes[1] = parseInt('96', 16)
    bytes[2] = parseInt('70', 16)
    bytes[3] = parseInt('27', 16)
    bytes[4] = parseInt('C4', 16)
    bytes[5] = parseInt('7A', 16)
    bytes[6] = parseInt('E5', 16)
    bytes[7] = parseInt('51', 16)

    let d = new Deserializer(bytes)
    let l = d.getLong()
    expect(l).toBe('51e57ac42770964a')
  })

  it('should handle different data type', () => {
    let bytes = hexToBytes('ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100')
    let d = new Deserializer(bytes)
    let i = d.getInt256()
    expect(i).toBe('00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff')
  })

  it('should throw error', () => {
    let d = new Deserializer(new Uint8Array(16))
    expect(() => d['_getBigIntN'](13)).toThrowError('Deserializer: invalid length! 13')
  })


  it('should get long from padded', () => {
    let bytes = new Uint8Array(8)
    bytes[0] = parseInt('4A', 16)
    bytes[1] = parseInt('96', 16)
    bytes[2] = parseInt('70', 16)
    bytes[3] = parseInt('27', 16)
    bytes[4] = parseInt('C4', 16)
    bytes[5] = parseInt('7A', 16)

    let d = new Deserializer(bytes)
    let l = d.getLong()
    expect(l).toBe('00007ac42770964a')
    expect(d.offset).toBe(8)
  })

  it('should get utf8 string', () => {
    let bytes = hexToBytes(
      '72e4b88ae6b5b7e38081e893ace88eb1e38081e38395e383a9e383b3e382b9e38081e382aae383a9e383b3e' +
      '38380e38081e38381e38399e38383e38388e38081e4baace983bde38081e383ade383b3e38389e383b3e380' +
      '81e383ade382b7e382a2e38081e382aae383abe383ace382a2e383b300'
    )
      let d = new Deserializer(bytes)
      let s = d.getString()
      expect(s).toBe('上海、蓬莱、フランス、オランダ、チベット、京都、ロンドン、ロシア、オルレアン')
  })

  let schema = {
    "constructors": [{
      "id": "85337187",
      "predicate": "auth.resPQ",
      "params": [{
        "name": "nonce",
        "type": "int128"
      }, {
        "name": "server_nonce",
        "type": "int128"
      }, {
        "name": "pq",
        "type": "bytes"
      }, {
        "name": "server_public_key_fingerprints",
        "type": "Vector<long>"
      }],
      "type": "auth.ResPQ"
    }],
    "methods": [{
      "id": "1615239032",
      "method": "auth.req_pq",
      "params": [{
        "name": "nonce",
        "type": "int128"
      }],
      "type": "auth.ResPQ"
    }]
  }

  it('should get object', () => {
    let bytes = hexToBytes('632416053E0549828CCA27E966B301A48FECE2FCA5CF4D33F4A11EA877BA4AA5739073300817ED48941A08F98100000015C4B51C01000000216BE86C022BB4C3')
    let d = new Deserializer(bytes)
    let obj = d.getObject('auth.ResPQ', schema)
  })

})
