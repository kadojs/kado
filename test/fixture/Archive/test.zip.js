/*
  $ unzip -v test.zip
  Archive:  test.zip
   Length   Method    Size  Cmpr    Date    Time   CRC-32   Name
  --------  ------  ------- ---- ---------- ----- --------  ----
      5120  Stored     5120   0% 2021-12-30 01:39 84a6a1b7  test1
     33792  Defl:X       49 100% 2021-12-30 01:39 91da9fe0  test2
       835  Defl:X      317  62% 2021-12-30 01:39 d267dc25  test3
  --------          -------  ---                            -------
     39747             5486  86%                            3 files
*/
module.exports = {
  count: 3,
  names: ['test1', 'test2', 'test3'],
  sizes: [5120, 33792, 835],
  sha1s: [
    '52478e87589ab97f0e5cce8d8d1746d3a447b9fb',
    'b298461015225596408ede229371bb39a5e9c1fb',
    'f59fc3328de32ce4ccf5a21e2798f05f4b87c566'
  ],
  buffer: Buffer.from(`
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
         `, 'base64')
}