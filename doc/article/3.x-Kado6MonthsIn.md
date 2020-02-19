# Kado 6 Months In
*by Bryan Ramey on 8/30/19*

## Working With Kado: Thoughts and Impressions

### Summary

I have now been actively developing with Kado for 6 months in a professional
environment and I truly feel that Kado as a development platform has made the
process easier and faster for many reasons.

### Problem Solving

One of the disadvantages I have experienced as well as read about many times in
developing with Node.JS is that starting a project from scratch is often time
consuming and requires an experienced developer. With Kado, this entire process,
as well as setting up a main and admin panel when I desire, is done on install.
After I install and with little configuration, I can simply start my application
and go to localhost:3000 (admin) and localhost:3001 (main) to begin developing.
Kado also makes it very easy to override the default views that come installed
and begin developing the look of my applications. 

## Advantages in Productivity and Start Time

### Advantage Driven

Another advantage of using Kado as a development platform that cuts down on
production time is the packages it comes with. Only a couple years ago,
developing in Node.JS was made more difficult by the lack of supporting quality
packages. Doing simple things such as logging and formatting those logs took a
long time to accomplish compared to other languages such as PHP. Today that is
no longer case. There are quality packages for some basic as well as more
advanced functions to support developers and our application development and
Kado has gathered some of the best and included them as well as integrated some
into Kado itself. An example is Winston. Winston is a lightweight simple and
universal logging library and using Winston with Kado is as easy as
K.log('This is an INFO message') or K.log.error('This is an Error!'). Kado
produces readable and clear logs including date and time, project name, levels,
and descriptions. After start-up, I see a log that looks similar to this:

```
[2019-08-29T18:45:00.1234 – KADO] INFO: ProjectName started!
```

It does not get much better than that. Other packages included for developing
ease include Moment, Mustache, Bluebird, Bootstrap etc... as well as packages
used in everyday Node.JS development such as Express, jQuery, MySQL2, and
Sequelize. These packages are all examples of packages I use everyday developing
and I find being able to access them quickly with Kado's K. structure to be very
time saving and easy. It also makes it easier to develop a pattern to your work.
For example, I use the `K.bluebird()`, `K.datatable()`, and
`K.modelRemoveById()` daily. 

### Project Spin Up

The fastest way to see Kado in action after installing and creating an `app.js`
file is to insert the Kado samples. After I do this, I can immediately run
`node app` and have access to an admin panel and a main website. This is fast
and allows me to see the work I am doing right away. But what if I want to
override the main view to look like my site? This is also very easily done with
Kado. In the app.js file, I can override the views folder or files to look for
my view files. I accomplish this by creating an interface folder in my
application with a main and admin folder and a views folder in each of those.
Than I use the files in these folders to override the default views. An example
of this can be found at https://kado.org/doc/3.10.6/configuration/

### Review and Future Posts

There are many other things that are made easier and faster with Kado being used
as the development platform including the file structure of Kado itself and
Module creation. Module creation is fast and simple, and after answering a few
questions, I can include a new module into the admin panel, the main panel if I
choose, create a Model, and create files for basic lists and entries in the
admin panel, making creating modules and editing and creating items in that
module faster and more efficient. Module creation is another feature in Kado I
enjoy as it takes allot of the hassle out of the process. The routes, views,
and basic functions of my modules are created and I don't have to worry about
the structure of my project while creating modules. I will dig deeper into
module creation next time as it is a major reason why I enjoy and recommend
developing with Kado.
