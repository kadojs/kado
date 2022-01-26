# GeoIP
*Introduced in 4.4.0*
> Stability: 2 Stable
```js
const GeoIP = require('../lib/GeoIP')
```

The `GeoIP` library provides a native NodeJS API for the GeoLite data from
MaxMind, which provides the ability to look up IP addresses to find
(approximate) geolocation information.  Close enough for automatic timezone or
locale setting, but nothing like actual GPS.

It relies on data from Maxmind, which must be obtained by the end user as the
data itself is licensed.  There is a "free" dataset which is both incomplete and
outdated but allows this library to operate without requirement of Maxmind
licensing.

Both IPv4 and IPv6 addresses are supported, however since the GeoLite IPv6
database does not currently contain any city or region information, city,
region and postal code lookups are only supported for IPv4.

This library is completely synchronous, there are no callbacks or promises
involved.  All blocking file IO is done at startup time, so all runtime calls
are executed in-memory and are fast.  Startup may incur a small delay of some
hundreds of milliseconds while it reads into memory and indexes data files.

This work is based on `node-geoip` with heavy modification, but
functionally similar.  It was converted to ES6 styling and provided a Class
wrapper, all external dependencies were inlined or imported as other Kado
libraries.

[the original `node-geoip` may be found here](https://github.com/geoip-lite/node-geoip)

## Post-installation Dataset Download (required)

The dataset required for lookups is not included in any form with the source
distribution, to ease licensing differences and byte-bloat.  To obtain any data
you must use the updater tool to, at minimum, install the `free` dataset.  For
more accurate results you will want to obtain and use a MaxMind license key you
may create an account
[here](https://www.maxmind.com/en/geolite2/signup) and then obtain a key from
[here](https://support.maxmind.com/account-faq/account-related/how-do-i-generate-a-license-key/),
which then can be provided to the updater tool.

Simple setup can be done using `npm run geoip-update` which will download a
preprocessed dataset containing the `free` version (same data as is bundled
with upstream `node-geoip`) from the Kado website.

To install a complete and up-to-date dataset with your MaxMind license key,
which uses quite a bit of RAM and a short while to convert from CSV into the
internal quick-lookup binary structure, run
```sh
npm install
node geoip-update YOUR_LICENSE_KEY
```
to install the required submodule for the dataset conversion and then download
and convert the data files (replace `YOUR_LICENSE_KEY` with your MaxMind key).

If you have a low-memory situation you can process the data files on a system
with enough resources elsewhere, and copy the binary results (dataset) to the
live server into runtime location `deps/geoip`.  This updater will check the
available MaxMind information and if it is not different from the installed
dataset it will skip all processing.  This library also preloads the entire
dataset into memory at runtime so if you are seriously slim on RAM it may still
not work with anything but the small `free` dataset.

## Class: GeoIP

This is the main class, based on `node-geoip` with heavy modification, but
functionally similar.

### Usage Synopsis

```js
const geoip = require('../lib/GeoIP').getInstance()

const ip = '207.97.227.239'
const geo = geoip.lookup(ip)

console.log(JSON.stringify(geo, null, 2))
```
Result:
```json
{
  "country": "US",
  "city": "San Antonio",
  "region": "TX",
  "timezone": "America/Chicago",
  "ll": [ 29.4969, -98.4032 ],
  "range": [ 3479298048, 3479300095 ],
  "eu": "0",
  "metro": 641,
  "area": 1000
}
```

### API

### geoip.lookup(ip)
* `ip` {string|number} Valid IP address string, or IPv4 32-bit number
* Return {Object} Structure and content described below

If you have an IP address in dotted quad notation, IPv6 colon notation, or a
32-bit unsigned integer (treated as an IPv4 address), pass it to the `lookup`
method.
```javascript
var geo = geoip.lookup(ip);
```
If the IP address was found, the `lookup` method returns an object with the following structure:
```javascript
{
   range: [ <low bound of IP block>, <high bound of IP block> ],
   country: 'XX',                 // 2 letter ISO-3166-1 country code
   region: 'RR',                  // Up to 3 alphanumeric variable length characters as ISO 3166-2 code
                                  // For US states this is the 2 letter state
                                  // For the United Kingdom this could be ENG as a country like “England
                                  // FIPS 10-4 subcountry code
   eu: '0',                       // 1 if the country is a member state of the European Union, 0 otherwise.
   timezone: 'Country/Zone',      // Timezone from IANA Time Zone Database
   city: "City Name",             // This is the full city name
   ll: [<latitude>, <longitude>], // The latitude and longitude of the city
   metro: <metro code>,           // Metro code
   area: <accuracy_radius>        // The approximate accuracy radius (km), around the latitude and longitude
}
```

The actual values for the `range` array depend on whether the IP is IPv4 or IPv6
and should be considered internal to `geoip-lite`.  To get a human-readable
format, pass them to `geoip.pretty()`

If the IP address was not found, the `lookup` returns `null`

### static geoip.pretty(ip)
* `ip` {number|Array|string} Valid IPv4 32-bit number, or IP address Array
* Return {string} Human-readable form of the ip, or if string the same string

Given a 32-bit unsigned integer, or an item returned as part of the `range`
array from the `lookup` method, the `pretty` method can be used to turn it into
a human-readable string.
```javascript
    console.log("The IP is %s", geoip.pretty(ip));
```
It is a convenience wrapper around `Network.inetNtoA(ip)` but if sent some other
data type it just returns the input (not an IP: fail softly; so it can be used
as a generic filter, in case of sources where the `ip` could be strings like
`"none"` or `"n/a"` or `""`)

### async geoip.reloadData(cb)
* `cb` {function} Callback function when reload is complete
* Return {*} Whatever the callback function returns (if anything)

Reload the dataset from disk, if the data has been changed or updated behind a
running instance.  Callback function `cb` will be called upon completion of the
dataset load into memory.  There must be approximately double the memory because
the new dataset is loaded into new variables which replace the actual dataset at
the end of the process just before `cb` is called, so there is temporary memory
bloat equal to the size of the disk dataset.
```js
geoip.reloadData(() => {
  console.log('Reload complete')
})
```
It is left as an exercise to the implementor to detect file changes and attach
this function call to that occurrence somehow, such as an event handler.

### geoip.reloadDataSync()

Same as `reloadData` except synchronously, this accepts and returns nothing,
but doesn't return execution until dataset reloading is complete.  Otherwise
everything documented under `reloadData` applies.
```js
geoip.reloadDataSync()
console.log('Reload complete')
```

## References
> - [Documentation from MaxMind](http://www.maxmind.com/app/iso3166)
> - [ISO 3166 (1 & 2) codes](http://en.wikipedia.org/wiki/ISO_3166)
> - [FIPS region codes](http://en.wikipedia.org/wiki/List_of_FIPS_region_codes)
