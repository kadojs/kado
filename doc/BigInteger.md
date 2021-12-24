# BigInteger
*Introduced in 4.3.0*
> Stability: 2 - Stable
```js
const BigInteger = require('kado/lib/BigInteger')
```
The `BigInteger` library implements methods to handle very large numbers

## Class: BigInteger
BigInteger is the main interface

### `BigInteger.constructor(a, b, c)`
* `a` {string|number} string: whole number; number: first 32-bits
* `b` {string|number} If `a` is string: radix; if `a` is number: second 32-bits
* `c` {string|number} Something else
* Returns: {BigInteger} new instance of `BigInteger`

### `BigInteger.newByValue(v)`
* `v` {number} Value
* Returns: {BigInteger} new instance of `BigInteger` based on value `v`

### `BigInteger.clone()`
* Returns: {BigInteger} New clone of `this`

## Coercion Operations
### `BigInteger.intValue()`
* Returns: {number} `this` as integer

### `BigInteger.byteValue()`
* Returns: {number} `this` as byte (8-bits)

### `BigInteger.shortValue()`
* Returns: {number} `this` as short (16-bits)

### `BigInteger.toByteArray()`
* Returns: {Array} `this` as big-endian byte array

### `BigInteger.toString(radix)`
* `radix` {string} Desired radix
* Returns: {string} `this` as a string of radix `radix`

## Comparison Operations
### `BigInteger.compareTo(a)`
* `a` {BigInteger} Operand to compare with `this`
* Returns: {number} `this` < `a`: positive delta; equal: 0; `this` > `a`: negative delta

### `BigInteger.equals(a)`
* `a` {BigInteger} Operand to compare with `this`
* Returns: {boolean} `this` === `a`

### `BigInteger.min(a)`
* `a` {BigInteger} Operand to compare with `this`
* Returns: {BigInteger} Minimal of either `this` or `a`

### `BigInteger.max(a)`
* `a` {BigInteger} Operand to compare with `this`
* Returns: {BigInteger} Maximal of either `this` or `a`

## Bitwise Operations
### `BigInteger.not()`
### `BigInteger.and(a)`
### `BigInteger.andNot(a)`
### `BigInteger.or(a)`
### `BigInteger.xor(a)`
### `BigInteger.shiftLeft(n)`
### `BigInteger.shiftRight(n)`
### `BigInteger.getLowestSetBit()`
### `BigInteger.bitCount()`
### `BigInteger.bitLength()`
* Returns: {number} The number of bits in `this`

### `BigInteger.testBit(n)`
### `BigInteger.setBit(n)`
### `BigInteger.clearBit(n)`
### `BigInteger.flipBit(n)`

## Arithmetic Operations
### `BigInteger.add(a)`
### `BigInteger.subtract(a)`
### `BigInteger.multiply(a)`
### `BigInteger.divide(a)`
### `BigInteger.remainder(a)`
### `BigInteger.divideAndRemainder(a)`
### `BigInteger.mod(a)`
* `a` {BigInteger} Operand for mod operation
* Returns: {BigInteger} Representation of `this % a`

### `BigInteger.modPow(e, m)`
### `BigInteger.modPowInt(e, m)`
* `e` {number} Exponent for pow operation; `0 <= e < 2^32`
* `m` {BigInteger} Operand for mod operation
* Returns: {number} Representation of `this^e % m'`

### `BigInteger.modInverse(m)`
### `BigInteger.pow(e)`
### `BigInteger.square()`
### `BigInteger.gcd(a)`
### `BigInteger.negate()`
* Returns: {BigInteger} Representation of `-(this)`

### `BigInteger.abs()`
* Returns: {BigInteger} Representation of `Math.abs(this)`

### `BigInteger.signum()`
* Returns: {number} `this` < 0: -1; equal: 0; `this` > 0: 1

### `BigInteger.isProbablePrime(t)`

---
> BigInteger interfaces not implemented in jsbn:
> * BigInteger(int signum, byte[] magnitude)
> * double doubleValue()
> * float floatValue()
> * int hashCode()
> * long longValue()
> * static BigInteger valueOf(long val)
