# GetOpt
*Introduced in 4.0.0*
> Stability: 2 - Stable
```js
const GetOpt = require('kado/lib/GetOpt')
```
The `GetOpt` library implements the POSIX _getopt()_ function, providing a
functional interface for option parsing.

## Class: GetOpt
GetOpt is a general-purpose command line parser that follows the POSIX
guidelines for command-line utilities.  Using these guidelines encourages
common conventions among applications, including use of:
* short option names (e.g., `-r`)
* options with arguments (e.g., `-f filename` or `-ffilename`)
* chaining short option names when options have no arguments (e.g., `-ra`)

This implementation mirrors the Solaris _getopt()_ implementation and supports
long option names (e.g., `--recurse`), potentially with values specified using
`=` (e.g., `--file=/path/to/file`).

Unlike other option parsers available for Node.js, the POSIX _getopt()_ interface
supports using the same option multiple times (e.g., `-vvv`, commonly used to
indicate level of verbosity).

For further reference on the relevant POSIX standards, see the following:
* http://pubs.opengroup.org/onlinepubs/009695399/functions/getopt.html
  http://pubs.opengroup.org/onlinepubs/009695399/utilities/getopts.html

The Utility Syntax Guidelines are described here:
* http://pubs.opengroup.org/onlinepubs/009695399/basedefs/xbd_chap12.html

### `static GetOpt.getInstance(argv, optstring, optind)`
* _Options same as main constructor,
  [below](#getoptconstructorargv-optstring-optind)_
* Returns: {GetOpt} current (or if none, new) instance of GetOpt

### `GetOpt.constructor(argv, optstring, optind)`
* `argv` {Array} Arguments, usually directly from `process.argv`
* `optstring` {string} See [Below](#format-of-optstring) (Default: result of
  [`GetOpt.buildOptionString(argv)`](#getoptbuildoptionstringargv))
* `optind` {number} Offset within `argv` to begin parsing (Default: `2`)
* Returns: {GetOpt} new instance of `GetOpt`

Instantiates a new object for parsing the specified arguments using the
specified option string.  This interface is closest to the traditional getopt()
C function.  Callers first instantiate a GetOpt class and then invoke the
`getopt()` method to iterate the options as they would in C, although this
interface allows the same option to be specified multiple times.  The optional
third argument to the constructor `optind` is the number of arguments from
`argv` to skip.  By default `optind` is set to `2`, so the first two arguments
in `argv` are ignored, since they generally denote the path to the node
executable and the script being run.

##### Format of `optstring`
The option string consists of an optional leading `:` (see below) followed by a
sequence of option-specifiers.  Each option-specifier consists of a single
character denoting the short option name, optionally followed by a colon if the
option takes an argument and/or a sequence of strings in parentheses
representing long-option aliases for the option name.

Example option strings:

	':r'            Command takes one option, with no args: -r
	':ra'           Command takes two options, with no args: -r and -a
	':raf:'         Command takes two options, with no args: -r and -a
	                and a single option that takes an arg: -f
	':f:(file)'     Command takes a single option with an argument: -f
	                -f can also be specified as --file

The presence of a leading colon in the option string determines the behavior
when an argument is not specified for an option which takes an argument.  See
[`GetOpt.getopt()`](#getoptgetopt) below.  Additionally, if no colon is specified, then error messages are
printed to stderr when invalid options, options with missing arguments, or
options with unexpected arguments are encountered.

### `GetOpt.parseOptionString(optstring)`
* `optstring` {string} Any string following the
  [rules above](#format-of-optstring)
* Returns {void}

Parse the option string and update the following internal vars:
* `gop_silent` {boolean} Whether to log errors to stderr.  Silent mode is
  indicated by a leading ':' in the option string.
* `gop_options` {Object} Maps valid single-letter-options to booleans indicating
  whether each option is required.
* `gop_aliases` {Object} Maps valid long options to the corresponding
  single-letter short option.

### `GetOpt.buildOptionString(argv)`
* `argv` {Array} Arguments, usually directly from `process.argv`
* Returns {string} an `optstring` inferred from `argv`

This method, usually called internally via omitting an `optstring` in the
constructor, allows for quick usage without a static `optstring`.  This allows
for simplified usage slightly more like "minimist" or others.

### `GetOpt.optind()`
Returns the next argv-argument to be parsed.  When options are specified as
separate `argv` arguments, this value is incremented with each option parsed.
When multiple options are specified in the same argv-argument, the returned
value is unspecified.  This matches the variable "OPTIND" from the POSIX
standard, but is read-only.  (If you want to reset OPTIND, you must create a new
`GetOpt` instance.)  This is most useful after parsing has finished to
examine the non-option arguments.

This value starts at `2` as described under
[_Departures from POSIX_](#departures-from-posix) below.

### `GetOpt.getopt()`
* Returns {mixed} the next argument specified in `argv` (the objects constructor
  argument).  The returned value is either undefined or an object with at least
  the following members:

  	option		single-character option name

  The following members may also be present:

  	optarg		argument value, if any
  	optopt		option character that caused the error, if any
  	error		if true, this object represents an error

This function scans `argv` starting at the current value of `optind` and returns
an object describing the next argument based on the following cases:
* If the end of command line arguments is reached, an undefined value is
  returned.  The end of arguments is signified by a single `-` argument, a
  single `--` argument, an argument that's neither an option nor a previous
  option's argument, the end of `argv`, or an error.
* If an unrecognized command line option is found (i.e. an option character
  not defined in `optstring`), the returned object's `option` member
  is just `?`.  `optopt` is set to the unrecognized option letter.  `error`
  is set to a true value.
* If a known command line option is found and the option takes no arguments
  then the returned object's `option` member is the option's short name
  (i.e.  the single character specifier in `optstring`).
* If a known command line option is found and that option takes an argument
  and the argument is also found, then the returned object's `option`
  member is the option's short name and the `optarg` member contains the
  argument's value.
* If a known command line option is found and that option takes an argument
  but the argument is not found, then the returned objects `option` member
  is `?` unless the first character of `optstring` was a colon, in which
  case the `option` member is set to `:`.  Either way, the `optopt` member
  is set to the option character that caused the error and `error` is set to
  `true`.

### `GetOpt.opts()`
* Returns {Object} convenience method to collect and return every option.
  Loops over calls to [`.getopt()`](#getoptgetopt) and returns an object with
  keys per option set to either `true` for boolean options, or the `optarg`
  string if it accepts one.  Combined with automatic `optstring` this
  approximates an interface similar to "minimist"

### `static GetOpt.mapArguments(args, opts)`
Quick method to collate a set of option aliases into standard option keys
* `args` {Array} Argument map
* `opts` {Object} Options map
* Returns {Object} Options from `opts` renamed as mapped in `args`

---
#### Departures from POSIX
* Global state in the C implementation (e.g., `optind`, `optarg`, and `optopt`) is
  encapsulated in the GetOpt class.  `optind` is available as a method
  call on the GetOpt class.  `optarg` and `optopt` are returned directly by
  getopt().
* Rather than returning an integer or character, GetOpt returns an object
  with the "option" field corresponding to the processed option character
  and possibly the additional `optarg` and `optopt` fields.  If an error
  occurs on a particular option, `error` is also set.  If an error occurs on
  no particular option or if the end of input is encountered, undefined is
  returned.
* Long option forms are supported as described above.  This introduces an
  additional error case which is where an argument of the form
  `--option=value` is encountered, where `option` does not take a value.
* POSIX starts `optind` at `1`, since `argv[0]` is generally the name of the
  command and options start at `argv[1]`.  This implementation starts `optind`
  at `2`, since `argv[0]` is generally the path to the node binary and `argv[1]`
  is the path to the script, so options start with `argv[2]`.
* Added support for providing no `optstring` and inferring from what was
  available in `argv`, and a one-shot method to collect and return all options
  via key-value object.  These two modifications allow for simplified usage
  similar to "minimist" or others.
