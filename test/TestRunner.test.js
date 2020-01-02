'use strict';
const runner = require('../lib/TestRunner').getInstance('Kado')
const { expect } = require('../lib/Validate')
const suite1 = runner.suite('suite1')
const getOne = function(){ return new Promise((resolve)=>{
  setTimeout(()=>{ resolve(1) },2)
}) }
runner.before(()=>{ console.log('stuff before running tests') })
suite1.after(()=>{ console.log('some stuff after the suite ') })
runner.after(()=>{ console.log('some stuff after the tests') })
suite1.it('should do stuff',()=>{ expect.eq(true) })
suite1.it('should do stuff 1',()=>{ expect.eq('true','true') })
suite1.it('should do stuff 2',async ()=>{ expect.eq(await getOne(),1) })
suite1.it('should do stuff 3',function(){
  this.timeout(2)
  return new Promise((resolve)=>{ setTimeout(()=>{
    resolve(expect.eq(null,null))
  },10) })
})
suite1.it('should do stuff 4',()=>{ expect.eq(false) })
suite1.it('should do stuff 5',()=>{ throw new Error('foo') })
//suites should recurse
const test2 = suite1.suite('something nested')
test2.it('should do more stuff',()=>{ expect.eq() })
//and again
const test3 = test2.suite('something really deep')
test3.it('that is what she said',()=>{ expect.eq() })
runner.test('something out of band',()=>{ expect.eq(false,false) })
runner.test('something out of band 2',()=>{ expect.eq(false,true) })
runner.execute()
  .then(code => {
    expect.eq(code,4)
    console.log('TestRunner test passing!')
  })
  .catch((e)=>{
    console.log(`TestRunner testing failed: ${e.message}`)
    process.exit(1)
  })
