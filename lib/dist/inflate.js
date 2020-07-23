const fs = require('../FileSystem')
const Stream = require('stream')
const zlib = require('zlib')
const inFileOriginal = process.argv[2]
const inFile = fs.path.resolve(inFileOriginal)
if (!fs.exists(inFileOriginal)) throw new Error('File to inflate not found')
const outFile = inFile.replace(/\.gz$/, '')
const inStream = fs.createReadStream(inFile)
const outStream = fs.createWriteStream(outFile)
const deflate = zlib.createInflate()
Stream.pipeline(inStream, deflate, outStream, (err) => {
  if (err) throw err
  console.log('Inflate complete')
})
