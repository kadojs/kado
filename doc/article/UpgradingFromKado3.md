# Upgrading from Kado 3
*By Bryan Tong 2/19/20*

**NOTE** In order to keep receiving Kado 3 updates you will need to update your
`package.json` and make the Kado line read as follows:

```json
{
  "dependencies": {
    "kado": "git+https://git.nullivex.com/kado/kado#3.x"
  }
}
```

Once this change is made you will continue to stay up to date with the latest
release of Kado version 3. Please keep in mind there will be no more Kado 3
releases on NPM. Now on with the upgrade notes.

Kado 4 is a major improvement over Kado 3 and you will not find many
similarities between the two. Kado 4 is an entirely new approach to solving
the problem originally presented in our [Thesis](Thesis.md). We have looked
backwards into how to write high quality libraries that are used for C++ and
other languages. Afterwards, we came to a new conclusion on how the Kado
functionality should be presented to the end user.

In comes Kado 4, what changes with Kado 4 is an entirely new collection of
libraries that provide all the common functionality to build what Kado 3 had
done previously. This is a great time to contrast Kado 3. When we built and
released Kado 3 the system was fully packaged with all the dependencies etc
to open Kado up and have an admin panel and website working. The problem with
this approach was that it introduced numerous opinions on software choices and
limited developers on ways to extend the software. Our goal was to provide a
more limitless environment so that Kado doesnt impose on the implementers and
focuses on enhancing their experience.

Kado 4 is a first for the JavaScript community for the fact that Kado 4
introduces and fully ECMA 2015, 2017, 2018, 2019+ (ES6+) compatible set of
libraries. These libraries provide HTTP servers, routing, command line
applications, and much much more.

At this point you might be wondering why all this matters? Well it is to explain
how Kado 4 is not a clear upgrade from Kado 3. With that being said, Kado 4
requires some groundwork understanding of why it was created in order to
fabricate an upgrade plan on your Kado 3 application. First of all, lets
make a note that **Kado 3 will be maintained until 2022**. So you have some
time to work through these upgrades. We have also **Frozen the Kado 3 API** to
keep the current applications working great.

Kado 4 will replace `express` as well as many of the packages required by it.
Furthermore, by employing the new functionality in ES6+ you can significantly
reduce package requirements. Also, if you find a common library that you believe
should be in Kado 4 and save you a dependency, open an issue and inquire if we
are interested in merging it and then by all means open a merge request.

You will have to build a new `app.js` file and new interface setup which may
take some thought in order to formulate the best approach. Be sure to check
the guides on Kado 4 which will provide insight on how to approach certain
problems. We believe, overall you will have a much easier experience writing
applications the way you want!

We apologize this upgrade path is not more clear and we will continue to do
what we can to support applications built on Kado 3 for the near future. If
you have questions on how to go about upgrading or understanding Kado 4 please
send an email to support at kado dot org.
