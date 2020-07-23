const fs = require('../FileSystem')
const Stream = require('stream')
const zlib = require('zlib')
const inFileOriginal = process.argv[2]
const inFile = fs.path.resolve(inFileOriginal)
if (!fs.exists(inFileOriginal)) throw new Error('File to compress not found')
const outFile = `${inFile}.gz`
const inStream = fs.createReadStream(inFile)
const outStream = fs.createWriteStream(outFile)
const deflate = zlib.createDeflate({ level: 9 })
Stream.pipeline(inStream, deflate, outStream, (err) => {
  if (err) throw err
  console.log('Compress complete')
})
