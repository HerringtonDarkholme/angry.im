import {bytesToHex, hexToBytes, nextRandomInt, bigIntToBytes, bytesToBigInt} from './convert'

import {
  copyInt_, copy_, isZero, add_, greater, sub_,
  rightShift_, equalsInt, eGCD_, divide_, int2bigInt,
  bigInt2str, str2bigInt, BigInt
} from 'BigInt'


var bpe
for (bpe=0; (1<<(bpe+1)) > (1<<bpe); bpe++);  //bpe=number of bits in the mantissa on this platform
bpe>>=1;                   //bpe=number of bits in one element of the array representing the bigInt

var one=int2bigInt(1,1,1);     //constant used in powMod_()

export function pqFactorize(bytes: Uint8Array): [Uint8Array, Uint8Array, number] {
  let what = bytesToBigInt(bytes)

  const minBits = 64
  let minLen = Math.ceil(minBits / bpe) + 1
  let it = 0, P, Q
  let a = new Array(minLen)
  let b = new Array(minLen)
  let c = new Array(minLen)
  let g = new Array(minLen)
  let z = new Array(minLen)
  let x = new Array(minLen)
  let y = new Array(minLen)

  for (let i = 0; i < 3; i++) {
    let q = (nextRandomInt(128) & 15) + 17;
    copyInt_(x, nextRandomInt(1000000000) + 1);
    copy_(y, x);
    let lim = 1 << (i + 18);

    for (let j = 1; j < lim; j++) {
      ++it;
      copy_(a, x);
      copy_(b, x);
      copyInt_(c, q);

      // the following loop is equivalent to add b to c for b times
      while (!isZero(b)) {
        // for b's every bit that is 1, add 2 ** k 's b
        if (b[0] & 1) {
          add_(c, a); // add a which is 2 ** k * b
          if (greater(c, what)) {
            sub_(c, what);
          }
        }
        add_(a, a); // a = a * 2 = b * 2 ** k
        if (greater(a, what)) {
          sub_(a, what);
        }
        rightShift_(b, 1);
      }
      // thus here, c = q + b ** 2

      copy_(x, c);
      if (greater(x,y)) {
        copy_(z, x);
        sub_(z, y);
      } else {
        copy_(z, y);
        sub_(z, x);
      }
      eGCD_(z, what, g, a, b);
      if (!equalsInt(g, 1)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        copy_(y, x);
      }
    }
    if (greater(g, one)) {
      break;
    }
  }

  divide_(what, g, x, y);

  if (greater(g, x)) {
    P = x;
    Q = g;
  } else {
    P = g;
    Q = x;
  }

  // console.log(dT(), 'done', bigInt2str(what, 10), bigInt2str(P, 10), bigInt2str(Q, 10));

  return [bigIntToBytes(P), bigIntToBytes(Q), it];
}
