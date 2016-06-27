import {Injectable} from '@angular/core'
import * as CryptoJS from 'crypto-js'
import {str2bigInt, powMod} from 'BigInt'

import './IGE-patch'
import {bytesToWords, wordsToBytes, bigIntToBytes, bytesToHex, bytesToBigInt} from './convert'
import {pqFactorize} from './pq-factorize.ts'

export {bytesToHex, hexToBytes, bytesToWords, } from './convert'

export interface PublickKey {
  modulus: string
  exponent: string
}

@Injectable()
export class Crypto {
  aesEncrypt(pText: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
    let msgWords = bytesToWords(pText)
    let keyWords = bytesToWords(key)
    let ivWords = bytesToWords(iv)
    let cipherParam = CryptoJS.AES.encrypt(msgWords, keyWords, {
      iv: ivWords,
      padding: CryptoJS.pad.NoPadding,
      mode: CryptoJS.mode.IGE
    })
    let ret = wordsToBytes(cipherParam.ciphertext)
    return ret
  }

  aesDecrypt(cText: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
    let msgWords = bytesToWords(cText)
    let keyWords = bytesToWords(key)
    let ivWords = bytesToWords(iv)
    let wordArray = CryptoJS.AES.decrypt({ciphertext: msgWords}, keyWords, {
      iv: ivWords,
      padding: CryptoJS.pad.NoPadding,
      mode: CryptoJS.mode.IGE
    })
    let ret = wordsToBytes(wordArray)
    return ret
  }

  rsaEncrypt(data: Uint8Array, publicKey: PublickKey): Uint8Array {
    let n = str2bigInt(publicKey.modulus, 16)
    let e = str2bigInt(publicKey.exponent, 16)
    let m = str2bigInt(bytesToHex(data), 16)
    let ret = powMod(m, e, n)
    return bigIntToBytes(ret)
  }

  sha1Hash(bytes: Uint8Array): Promise<Uint8Array> {
    return crypto.subtle.digest('sha-1', bytes).then(bf => new Uint8Array(bf))
  }

  // return a random buffer
  getNonce(byteLength): Uint8Array {
    let buf = new Uint8Array(byteLength)
    crypto.getRandomValues(buf)
    return buf
  }

  pqFactorize(bytes: Uint8Array): [Uint8Array, Uint8Array, number] {
    return pqFactorize(bytes)
  }

  powMod(gB: Uint8Array, bB: Uint8Array, pB: Uint8Array): Uint8Array {
    let g = bytesToBigInt(gB)
    let b = bytesToBigInt(bB)
    let p = bytesToBigInt(pB)
    return bigIntToBytes(powMod(g, b, p))
  }

  dhAuthKey(gaB: Uint8Array, bB: Uint8Array, pB: Uint8Array): Uint8Array {
    let ga = bytesToBigInt(gaB)
    let b = bytesToBigInt(bB)
    let p = bytesToBigInt(pB)
    return bigIntToBytes(powMod(ga, b, p))
  }

  addPadding(bytes: Uint8Array, blockSize: number): Uint8Array {
    var len = bytes.byteLength || bytes.length;
    var needPadding = blockSize - (len % blockSize);
    if (needPadding > 0 && needPadding < blockSize) {
      var padding = new Uint8Array(needPadding);
      crypto.getRandomValues(padding)
      bytes = new Uint8Array(bufferConcat(bytes, padding))
    }

    return bytes;
  }
}

function bufferConcat(buffer1: Uint8Array, buffer2: Uint8Array) {
  var l1 = buffer1.byteLength,
      l2 = buffer2.byteLength;
  var tmp = new Uint8Array(l1 + l2);
  tmp.set(buffer1, 0);
  tmp.set(buffer2, l1);
  return tmp.buffer;
}
