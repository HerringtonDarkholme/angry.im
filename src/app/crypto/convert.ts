import {str2bigInt, bigInt2str, BigInt} from 'BigInt'
import * as CryptoJS from 'crypto-js'

export function bytesToBigInt(bytes: Uint8Array): BigInt {
  let str = bytesToHex(bytes)
  return str2bigInt(str, 16)
}

export function nextRandomInt (maxValue) {
  return Math.floor(Math.random() * maxValue)
}


type WordArray = CryptoJS.lib.WordArray

export function bytesToWords(bytes: Uint8Array): WordArray {
  // pack byte[] to int32[]
  let len = bytes.length
  let words: number[] = []
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= bytes[i] << (24 - 8 * (i % 4))
  }
  return CryptoJS.lib.WordArray.create(words, len)
}

export function wordsToBytes(words: WordArray): Uint8Array {
  let wds = words.words
  let sigBytes = words.sigBytes
  let ret = []
  for (let i = 0; i < sigBytes; i++) {
    let bte = (wds[i >>> 2] >>> (24 - 8 * (i % 4))) & 0xff
    ret.push(bte)
  }
  return new Uint8Array(ret)
}

export function hexToBytes(str: string): Uint8Array {
  let len = str.length,
      start = 0,
      bytes = [];

  if (str.length % 2) {
    bytes.push(parseInt(str.charAt(0), 16));
    start++;
  }

  for (let i = start; i < len; i += 2) {
    bytes.push(parseInt(str.substr(i, 2), 16));
  }

  return new Uint8Array(bytes);
}

export function bytesToHex(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0, l = bytes.length; i < l; i++) {
    let prefix = bytes[i] < 16 ? '0' : ''
    s += prefix + bytes[i].toString(16)
  }
  return s
}

export function bigIntToBytes (bigInt: BigInt) {
  let str = bigInt2str(bigInt, 16);
  return hexToBytes(str);
}

export function hexToDec(hex: string) {
  return bigInt2str(str2bigInt(hex, 16), 10)
}

export function decToHex(dec: string) {
  return bigInt2str(str2bigInt(dec, 10), 16)
}
