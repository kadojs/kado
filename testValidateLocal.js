const Validate = require('./lib/Validate')
const obj1 = { test1: 'test1' }
class Obj2 {}
Obj2.prototype.test2 = 'test2'
class Obj3 extends Obj2 {
  constructor () {
    super()
    this.test3 = 'test3'
  }
}
const inst1 = new Obj2()
const inst2 = new Obj3()
const isTest1Local = Validate.isLocal(obj1, 'test1') // true
const isTest2Local = Validate.isLocal(inst1, 'test2') // false
const isTest3Local = Validate.isLocal(inst2, 'test3') // true
console.log('test1', isTest1Local, 'test2', isTest2Local, 'test3', isTest3Local)
