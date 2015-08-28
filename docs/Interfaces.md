# Kado Interfaces
by Bryan Tong, August 27th 2015

Kado implements a variety of interfaces than can be enabled optionally as they
are needed. A brief list of these interfaces.

* admin
* bin
* client
* main
* sales
* seller

Now that I have introduced the interfaces lets go over what they will all do.

#$# Admin

The admin panel will control how the system functions. Admin modules will 
provide internal and staff only functionality.

### Bin

The bin interface ecompasses the Kado script system. Allowing Kado users to
access different parts of the system through command line to run scripts
and perform maintenance on the Kado installation itself or the modules.

### Client

The client interface is designed for customer control and billing purposes.
Some modules may focus more on users in the main than clients. Thing of clients
as the customer billing and support system. There can be lots of enhanced
functionality here too though. I would recommend and features requiring login
be placed in the client interface.

### Main

Any company has a public facing website and this section of Kado is specifically
tailored to provide a public website. The wonderful part about Kado is that
each interface is completely full featured and modular.

### Sales

This interface is intended to be used with Point of Sales systems. The modules
that publish to this interface will follow touch friendly coding techniques.

### Seller

Most companies like to either A create a market place where sellers meet clients
or resell the companies services. Kado aims to implement seller privileges with
most of our core modules to provide a more encompassed interface.

## Listening Ports

Just to get it out of the way early, lets go over the listening ports that
are setup by default for the Kado interfaces.

* admin - 3003
* bin - none (command line only, maybe tty0 :)
* client - 3004
* main - 3000
* sales - 3005
* seller - 3006

In production I recommend leaving these port numbers as they are however
assign a separate localhost IP to each instance of Kado. For example,
127.0.2.1 for instance 1, 127.0.2.2 for instance 2. Before you ask, yes this
works completely without issue on linux. 127.0.0.0/8 is routed to localhost
loopback according to some RFC.
