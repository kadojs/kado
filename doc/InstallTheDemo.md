# Install the Demo
> NOTICE: Kado 3 is **DEPRECATED**, see https://kado.org for the latest version.

Quickly try out Kado!

Environment Requimrents: Node.JS 8+, MySQL 5.7 see
[installation](./Installation.md) for more.

For more information see the
[Github Repository](https://github.com/KadoOrg/kado-demo)

1) Clone the repository to a location locally.
`git clone https://github.com/KadoOrg/kado-demo.git`
3) From the repository folder execute `cd kado-demo; npm install`
4) Open and edit `app.js` to correct the database configuration to match your
local environment. If you would like to skip opening any files then to run this
demo considering you have root access to the MySQL instance, (Please use a
better method of authenticating MySQL in production!) execute the following
query: `CREATE DATABASE kadodemo; GRANT ALL ON kadodemo.* TO
'kadodemo'@'localhost' IDENTIFIED BY 'kadodemo'; FLUSH PRIVILEGES;`
4) Initialize your database and install sample content by executing
`node app kado insertsamples`
5) Start your application and test it out by executing `npm start`

In order to access Kado it brings two (2) ports alive by default.

Admin Panel: **http://localhost:3000**

Default Administrator
* Email: sample@kado.org
* Password: kado

Main Panel: **http://localhost:3001**

To find out more check out the documentation at https://kado.org

Thanks for trying us out!
