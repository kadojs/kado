# Kado 4.4 Released
*By Bryan Tong 10/12/22*

Welcome to Kado 4.4.0! This release has been in development for 15 months and
the work will show. Our team has spent much of the time working with Kado while
using it to write new applications.

Some applications have been migrated from existing express setups and into the
new Kado environment. Once we complete these migrations, the projects tend to
settle down and the changes become only the day to day operational needs. I
will be writing a new article to showcase how Kado has been helping us in
production and with various applications.

Kado 4.4 comes with new libraries to assist with more coding needs and makes
it possible to install even fewer dependencies in your project. Remember, as
Kado grows our code is still under 1MB (without compression) and your project
will only load the code that is being used. This is a huge advantage when you
run many processes.

Getting into a few specifics, we have added the GeoIP system. This is a broad
adaptation from existing GeoIP libraries that are available. In the meantime,
the code was adapted ported and upgraded to the latest ECMA coding standards.
Our goal is to continue to improve the coding tactics used here to make GeoIP
resolution faster. For now, the library is available for testing and
experimentation.

The Archive library will assist in building and reading various types of zip
and tar files. It is an overlay that aids in compression and file tree
traversal.

RequestEngine is an object containing a request method used to access API
instances. Regardless of the type of login, the request engine aids in
working with remotes. It is easy to make new instances of RequestEngine it
can even be done on the fly to turn any website into a remote API! We have been
using RequestEngine internally for two years in order to conduct tests against
our applications, as well as communicate between applications using our API.

View middleware allows for global modifications to output. This post-processing
system can provide many tools to manipulate output on the global level. See
the View documentation for more information about how to use the new middleware.

At the time of writing, Kado now ships with 51 libraries to assist with coding
needs. Passing 50 means we are going to start looking into deprecating less used
libraries or combining the into higher up libraries in order to keep our
code and documentation easier to manage.

Summary of Changes:
* Improved log dump to work with all variable types. [!309](https://git.nullivex.com/kado/kado/-/merge_requests/309)
* Added `log.print(msg)` which is an alias for `log.info(msg)` [!309](https://git.nullivex.com/kado/kado/-/merge_requests/309)
* Added `log.log(msg)` which is an alias for `log.info(msg)` [!309](https://git.nullivex.com/kado/kado/-/merge_requests/309)
* Fix issue with statusCode overwrite due to etag support in render. [!312](https://git.nullivex.com/kado/kado/-/merge_requests/312)
* Fix on delete propagation in regard to foreign key constraints. [!301](https://git.nullivex.com/kado/kado/-/merge_requests/301)
* Add File Support for JFIF. [!302](https://git.nullivex.com/kado/kado/-/merge_requests/302)
* Change session ID generator to avoid clashes. [!287](https://git.nullivex.com/kado/kado/-/merge_requests/287)
* Cache log instances to avoid overloading writers. [!303](https://git.nullivex.com/kado/kado/-/merge_requests/303)
* Format Library, add progress bar widget. [!304](https://git.nullivex.com/kado/kado/-/merge_requests/304)
* Graceful failure handling for JSON input. Better handling of invalid JSON input #110 and #103 [!310](https://git.nullivex.com/kado/kado/-/merge_requests/310)
* Mapper Library, add map. [!311](https://git.nullivex.com/kado/kado/-/merge_requests/311)
* Add working with email guide. [!317](https://git.nullivex.com/kado/kado/-/merge_requests/317)
* Assert Library, add ensure method for types. [!318](https://git.nullivex.com/kado/kado/-/merge_requests/318)
* Validate Library, add isOwn method. [!319](https://git.nullivex.com/kado/kado/-/merge_requests/319)
* Fix command help generation [!321](https://git.nullivex.com/kado/kado/-/merge_requests/321)
* Add Archive Library. [!326](https://git.nullivex.com/kado/kado/-/merge_requests/326)
* Add GeoIP Library. [!260](https://git.nullivex.com/kado/kado/-/merge_requests/260)
* Add Request Engine. [!332](https://git.nullivex.com/kado/kado/-/merge_requests/332)

There are more! See our [CHANGELOG](../../CHANGELOG.md)

With a jam packed Kado 4.4 release, we are excited. The new features in Kado
will not only propel your application but make life simpler coding having to
visit less places to get the job done!

Do you have feedback? We would love to hear it! Kado has been getting many
downloads, and we are confident that is going to continue to grow. Has Kado
helped you? If so, we would love to hear that as well.

Happy coding and keep reaching for the stars!

Sincerely,

The Kado Team
