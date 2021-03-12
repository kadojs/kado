# Writing Tests for Kado

All the tests are contained within the `test` folder. Test files
should be suffixed by `.test.js` and the file name should match
the name of the library it is testing such as `Asset.js` and
`Asset.test.js`

Tests are written using the `Validate.Assert` library which can be
included using `const { expect } = require('../lib/Validate')` from
within the tests. See [Validate.js](../Validate.md) for more.
