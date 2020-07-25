const fs = require('../FileSystem')
const Stream = require('stream')
const zlib = require('zlib')
const inFileOriginal = process.argv[2]
const inFile = fs.path.resolve(inFileOriginal)
if (!fs.exists(inFileOriginal)) throw new Error('File to inflate not found')
const outFile = inFile.replace(/\.gz$/, '')
if (fs.exists(outFile)) throw new Error('Destination exists')
const inStream = fs.createReadStream(inFile)
const outStream = fs.createWriteStream(outFile)
const gunzip = zlib.createGunzip()
Stream.pipeline(inStream, gunzip, outStream, (err) => {
  if (err) throw err
  console.log(`Inflate to ${outFile} complete`)
})
