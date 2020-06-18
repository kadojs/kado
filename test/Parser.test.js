'use strict'
/**
 * Kado - High Quality JavaScript Libraries based on ES6+ <https://kado.org>
 * Copyright © 2013-2020 Bryan Tong, NULLIVEX LLC. All rights reserved.
 *
 * This file is part of Kado.
 *
 * Kado is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kado is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kado.  If not, see <https://www.gnu.org/licenses/>.
 */
const runner = require('../lib/TestRunner').getInstance('Kado')
const Assert = require('../lib/Assert')
const Parser = require('../lib/Parser')
const cookieString = '_ga=GA1.2.637651231.1575923282;' +
  ' mm2_cookieA=06bad8dd-ecda-4e00-abbe-1e641adde6f0; _ym_d=1586356006;' +
  ' _ym_uid=1576356006128031579; __qca=P0-1332394709-1576356006094'
const queryString = 'view=choose&term=24&type=InternetPhone&configPage=true' +
  '&pageVisited=preBundlePage'
const htmlString = '<!doctype HTML><html lang="en"><head><title>Hello World' +
  '</title></head><body><h1>Hello World</h1></body></html>'
const entityString = '&lt;!doctype HTML&gt;&lt;html lang=&quot;en&quot;&gt;' +
  '&lt;head&gt;&lt;title&gt;Hello World&lt;/title&gt;&lt;/head&gt;' +
  '&lt;body&gt;&lt;h1&gt;Hello World&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;'
runner.suite('Parser', (it) => {
  it('should parse cookies', () => {
    const rv = Parser.cookie(cookieString)
    Assert.isType('Object', rv)
    Assert.eq(rv._ga, 'GA1.2.637651231.1575923282')
    Assert.eq(rv.mm2_cookieA, '06bad8dd-ecda-4e00-abbe-1e641adde6f0')
    Assert.eq(rv._ym_d, '1586356006')
    Assert.eq(rv._ym_uid, '1576356006128031579')
    Assert.eq(rv.__qca, 'P0-1332394709-1576356006094')
  })
  it('should parse query strings', () => {
    const rv = Parser.queryString(queryString)
    Assert.isType('object', rv)
    Assert.eq(rv.view, 'choose')
    Assert.eq(rv.term, '24')
    Assert.eq(rv.type, 'InternetPhone')
    Assert.eq(rv.configPage, 'true')
    Assert.eq(rv.pageVisited, 'preBundlePage')
  })
  it('should escape html tags', () => {
    const rv = Parser.htmlEscape(htmlString)
    Assert.eq(rv, entityString)
  })
  it('should unescape html tags', () => {
    const rv = Parser.htmlUnescape(entityString)
    Assert.eq(rv, htmlString)
  })
  it('should capitalize a string', () => {
    Assert.eq(Parser.capitalize('test'), 'Test')
  })
  it('should print a date', () => {
    const testDate = '1985-10-26 01:21:00'
    const printDate = Parser.printDate(new Date(testDate))
    Assert.isType('string', printDate)
    Assert.eq(testDate, printDate)
  })
  it('should escape and truncate a string', () => {
    const render = (s) => { return s }
    Assert.eq(Parser.escapeAndTruncate()(
      '2,<span>foo bar</span>', render), 'fo')
  })
  it('should separate TitleCase', () => {
    const rv = Parser.stringCaseSeparate('SomeTitleCase', '-').toLowerCase()
    Assert.eq(rv, 'some-title-case')
  })
  it('should separate camelCaseStuff', () => {
    const rv = Parser.stringCaseSeparate('somethingCamelCase')
    Assert.eq(rv, 'something Camel Case')
  })
  it('should create a path from a string', () => {
    const rv = Parser.stringToPath('some path i want', '-')
    Assert.eq(rv, 'some-path-i-want')
  })
  it('should create a path from a special string', () => {
    const rv = Parser.stringToPath('some f$%&kn path i want!!!!!')
    Assert.eq(rv, 'some/fkn/path/i/want')
  })
  it('should create a title string from uri', () => {
    const rv = Parser.stringToTitle('some-string-with-a-title', '-')
    Assert.eq(rv, 'Some String with a Title')
  })
  it('should create a title string', () => {
    const rv = Parser.stringToTitle('some title we need for stuff')
    Assert.eq(rv, 'Some Title We Need for Stuff')
  })
  it('should capitalize the first and last word of a title', () => {
    const rv = Parser.stringToTitle('and the dog came in')
    Assert.eq(rv, 'And the Dog Came In')
  })
})
if (require.main === module) runner.execute().then(code => process.exit(code))
