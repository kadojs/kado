# Download

Thank you for your interest in downloading Kado! Below, we will provide a few
different methods for importing Kado into your project or system.

## Kado 4 (latest)

### Install from NPM

```
$ npm install kado
```

This is the preferred installation method and is the easiest. Provided you have
already installed [Node.js](https://nodejs.org) then you should have `npm`
available on your system. Simply execute the command above from your project
root to install Kado into your project.

## Install from Yarn

```
$ yarn add kado
```

Yarn is a great package manager and works well in production.

### Direct Download

Please use the link below to download an archive file containing the latest
version of Kado.

* [kado-4.3.0.zip](https://git.nullivex.com/kado/kado/-/archive/v4.3.0/kado-v4.3.0.zip) - All Platforms
* [kado-4.3.0.tar.gz](https://git.nullivex.com/kado/kado/-/archive/v4.3.0/kado-v4.3.0.tar.gz) - All Platforms
* [kado-4.3.0.tar.bz2](https://git.nullivex.com/kado/kado/-/archive/v4.3.0/kado-v4.3.0.tar.bz2) - All Platforms
* [kado-4.3.0.tar](https://git.nullivex.com/kado/kado/-/archive/v4.3.0/kado-v4.3.0.tar) - All Platforms

For earlier versions see our [Release Page](https://git.nullivex.com/kado/kado/-/releases).

## Kado 3 (legacy)

### Install from NPM
NPM path for Kado 3 installations.
```
$ npm install git+https://git.nullivex.com/kado/kado#3.x
```

### Direct Download
Use the archives below for direct installation.
* [kado-3.10.7.zip](https://git.nullivex.com/kado/kado/-/archive/v3.10.7/kado-v3.10.7.zip) - All Platforms
* [kado-3.10.7.tar.gz](https://git.nullivex.com/kado/kado/-/archive/v3.10.7/kado-v3.10.7.tar.gz) - All Platforms
* [kado-3.10.7.tar.bz2](https://git.nullivex.com/kado/kado/-/archive/v3.10.7/kado-v3.10.7.tar.bz2) - All Platforms
* [kado-3.10.7.tar](https://git.nullivex.com/kado/kado/-/archive/v3.10.7/kado-v3.10.7.tar) - All Platforms

For earlier versions see our [Release Page](https://git.nullivex.com/kado/kado/-/releases).

## CDN Usage

Through the use of NPM based CDN services Kado can be used through their public
links. We do not encourage this method.

### JSDelivr

Using JSDeliver they provide a base URL and then you append the URI to the file
your program is interested in.

See our [JSDelivr Page](https://www.jsdelivr.com/package/npm/kado) for a
complete file list.

Example loading `kado/lib/Parse`
```
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/kado@4.2.0/lib/Parse.js"></script>
```

NOTE: Kado modules use CommonJS and as such CommonJS must be used
to load kado modules.
