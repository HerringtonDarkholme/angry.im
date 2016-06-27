import {
  it,
  inject,
  beforeEachProviders
} from '@angular/core/testing'

import {
  bytesToWords, Crypto, hexToBytes, bytesToHex
} from './index'
import * as CryptoJS from 'crypto-js'


// test case from https://www.mgp25.com/AESIGE/
const KEY        = hexToBytes('5468697320697320616E20696D706C65')
const IV         = hexToBytes('6d656e746174696f6e206f6620494745206d6f646520666f72204f70656e5353')
const PLAINTEXT  = hexToBytes('99706487a1cde613bc6de0b6f24b1c7aa448c8b9c3403e3467a8cad89340f53b')
const CIPHERTEXT =
  hexToBytes('4c2e204c6574277320686f70652042656e20676f74206974207269676874210ae1a0b27e8d1a11e9039aa9c80e3e7f83')

let crypto = new Crypto()

describe('Crypto', () => {
  it('should convert Uint8Array to WordArray', () => {
    let test = new Uint8Array([1,2,3,4,5,6,7,8])
    let wa = bytesToWords(test)
    expect(wa.toString()).toBe('0102030405060708')
  })

  it('should convert hexToBytes', () => {
    let hex = '17ed48941a08f981'
    let bytes = hexToBytes(hex)
    expect(hex).toBe(bytesToHex(bytes))

  })

  it('should factorize pq prime', () => {
    let pq = hexToBytes('17ed48941a08f981')
    let [p, q] = crypto.pqFactorize(pq)
    let pHex = bytesToHex(p)
    let qHex = bytesToHex(q)
    expect(pHex).toBe('494c553b')
    expect(qHex).toBe('53911073')
  })

  it('should aes encrypt in IGE mode', () => {
    let cipherText = crypto.aesEncrypt(PLAINTEXT, KEY, IV)
    let plainText = crypto.aesDecrypt(cipherText, KEY, IV)
    expect(bytesToHex(plainText)).toBe(bytesToHex(PLAINTEXT))
  })

  it('should aes decrypt in IGE mode', () => {
    let plainText = crypto.aesDecrypt(CIPHERTEXT, KEY, IV)
    let cipherText = crypto.aesEncrypt(plainText, KEY, IV)
    expect(bytesToHex(cipherText)).toBe(bytesToHex(CIPHERTEXT))
  })

  it('should do secure padding', () => {
    let a = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
    let ret = crypto.addPadding(a, 16)
    expect(ret.length).toBe(16)
    for (let i = 0; i < 8; i++) {
      expect(a[i]).toBe(ret[i])
    }
    let b = new Uint8Array(17)
    ret = crypto.addPadding(b, 16)
    expect(ret.length).toBe(32)
    for (let i = 0; i < 17; i++) {
      expect(b[i]).toBe(ret[i])
    }
  })

  const g = '2'
  const ga = '262aaba621cc4df587dc94cf8252258c0b9337dfb47545a49cdd5c9b8eae7236c6cadc40b24e88590f1cc2cc762ebf1cf11dcc0b393caad6cee4ee5848001c73acbb1d127e4cb93072aa3d1c8151b6fb6aa6124b7cd782eaf981bdcfce9d7a00e423bd9d194e8af78ef6501f415522e44522281c79d906ddb79c72e9c63d83fb2a940ff779dfb5f2fd786fb4ad71c9f08cf48758e534e9815f634f1e3a80a5e1c2af210c5ab762755ad4b2126dfa61a77fa9da967d65dfd0afb5cdf26c4d4e1a88b180f4e0d0b45ba1484f95cb2712b50bf3f5968d9d55c99c0fb9fb67bff56d7d4481b634514fba3488c4cda2fc0659990e8e868b28632875a9aa703bcdce8f'
  const b = '6f620afa575c9233eb4c014110a7bcaf49464f798a18a0981fea1e05e8da67d9681e0fd6df0edf0272ae3492451a84502f2efc0da18741a5fb80bd82296919a70faa6d07cbbbca2037ea7d3e327b61d585ed3373ee0553a91cbd29b01fa9a89d479ca53d57bde3a76fbd922a923a0a38b922c1d0701f53ff52d7ea9217080163a64901e766eb6a0f20bc391b64b9d1dd2cd13a7d0c946a3a7df8cec9e2236446f646c42cfe2b60a2a8d776e56c8d7519b08b88ed0970e10d12a8c9e355d765f2b7bbb7b4ca9360083435523cb0d57d2b106fd14f94b4eee79d8ac131ca56ad389c84fe279716f8124a543337fb9ea3d988ec5fa63d90a4ba3970e7a39e5c0de5'
  const p = 'c71caeb9c6b1c9048e6c522f70f13f73980d40238e3e21c14934d037563d930f48198a0aa7c14058229493d22530f4dbfa336f6e0ac925139543aed44cce7c3720fd51f69458705ac68cd4fe6b6b13abdc9746512969328454f18faf8c595f642477fe96bb2a941d5bcd1d4ac8cc49880708fa9b378e3c4f3a9060bee67cf9a4a4a695811051907e162753b56b0f6b410dba74d8a84b2a14b3144e0ef1284754fd17ed950d5965b4b9dd46582db1178d169c6bc465b0d6ff9ca3928fef5b9ae4e418fc15e83ebea0f87fa9ff5eed70050ded2849f47bf959d956850ce929851f0d8115f635b105ee2e4e15d04b2454bf6f4fadf034b10403119cd8e3b92fcc5b'
  const gb = '73700e7bfc7aeec828eb8e0dcc04d09a0dd56a1b4b35f72f0b55fce7db7ebb72d7c33c5d4aa59e1c74d09b01ae536b318cfed436afdb15fe9eb4c70d7f0cb14e46dbbde9053a64304361eb358a9bb32e9d5c2843fe87248b89c3f066a7d5876d61657acc52b0d81cd683b2a0fa93e8adab20377877f3bc3369bbf57b10f5b589e65a9c27490f30a0c70ffcfd3453f5b379c1b9727a573cffdca8d23c721b135b92e529b1cdd2f7abd4f34dac4be1eeaf60993dde8ed45890e4f47c26f2c0b2e037bb502739c8824f2a99e2b1e7e416583417cc79a8807a4bdac6a5e9805d4f6186c37d66f6988c9f9c752896f3d34d25529263faf2670a09b2a59ce35264511f'
  const dhKey = 'ab96e207c631300986f30ef97df55e179e63c112675f0ce502ee76d74bbee6cbd1e95772818881e9f2ff54bd52c258787474f6a7bea61eabe49d1d01d55f64fc07bc31685716ec8fb46feacf9502e42cfd6b9f45a08e90aa5c2b5933ac767cbe1cd50d8e64f89727ca4a1a5d32c0db80a9fcdbddd4f8d5a1e774198f1a4299f927c484feec395f29647e43c3243986f93609e23538c21871df50e00070b3b6a8fa9bc15628e8b43ff977409a61ceec5a21cf7dfb5a4cc28f5257bc30cd8f2fb92fbf21e28924065f50e0bbd5e11a420300e2c136b80e9826c6c5609b5371b7850aa628323b6422f3a94f6dfde4c3dc1ea60f7e11ee63122b3f39cbd1a8430157'

  it('should do dhAuthKey', () => {
    let gaB = hexToBytes(ga)
    let bB = hexToBytes(b)
    let pB = hexToBytes(p)

    let keyExpect = dhKey

    let keyActual = bytesToHex(crypto.dhAuthKey(gaB, bB, pB))

    expect(keyActual).toBe(keyExpect)
  })

  it('should get powMod', () => {
    let bB = hexToBytes(b)
    let pB = hexToBytes(p)
    let gB = hexToBytes(g)

    let gbActual = bytesToHex(crypto.powMod(gB, bB, pB))

    expect(gbActual).toBe(gb)
  })
})
