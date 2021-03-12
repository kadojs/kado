# Quick Start

This guide will illustrate the steps to make a new repository with a basic Kado
Hello World application,     which will be an easy point to start from.

Some features of the Hello World base line:
* Clustered application with workers for resilience and scaling.
* Built in Session Server for handling user sessions.
* Supports Cookies, Sessions, JSON Data, POST Data, and Query Strings.
* Static file server.
* Uses the Mustache Templating system with full partial support.
* Default development mode reloads routes and static files instantly.

## Steps to Get Started

1) Make a new blank repository

2) Checkout the repository to your favorite IDE

3) Add https://git.nullivex.com/kado/kado-base.git with the name "base" as a
remote to Git -> Remotes

4) From the terminal `$ git pull base master`

5) Add any extra initial commits.

6) Push to new repository.

Once these steps are completed, the code is ready for dependency resolution.

From the project root:
```
$ npm install
```

Now that Kado is installed as well as Mustache, the code is ready to run!

To start the project:
```
$ node app
```

Now the project can be accessed at [http://localhost:3000](http://localhost:3000)

Some possible next steps would be adding some more routes, or changing
the `index.html` file to be more to your liking.

It might also be worthwhile to experiment with the provided API.

Happy Coding!
