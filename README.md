# Kado [![Build Status](https://travis-ci.org/nullivex/kado.svg?branch=master)](https://travis-ci.org/nullivex/kado)

Module system for Enterprise Grade applications.

## Preface

Take a look at this blog post: https://www.nullivex.com/blog/kado-comeback

## What does it do

Kado provides a simple extensible environment to run
modules that group together to become an application.

This is contrary to the traditional approach of starting with
base code and assets then providing routes on top of that.
Kado aims to compress the duplicated code created during this
process and provide a simpler workflow for developers that
remains consistent regardless of a changing environment.

## Usage

Please see the documentation for more https://kado.org/docs

## Changelog

### 3.3.3 (staged)
* Fix sidebar issue with items with spaces in the name
* Fix missing lang pack issue with module generator

### 3.3.2
* Fix issues with module generation.
* Add more missing lang pack entries.

### 3.3.1
* Update license header.

### 3.3.0
* Prefer `kado_modules` folder to contain Kado modules.

### 3.2.0
* Move utility script to kado module so proper CLI look backs can happen.
* Improve module generation to be interactive, save and use config files
* Fix and test module generation to generate working code.
* Improve bootstrap script to have less options and generate with simplicity
* Expose utility cli through module globally for system usage

### 3.1.1
* Login referrer now filters possible static files as a setup.

### 3.1.0
* Minor fix to CLI suite, moves kado commands into setting module

### 3.0.0
* Drop pug
* Implement mustache templates
* Implement Language Packs! And add the following languages:
  * English
  * Spanish
* Implement datatables.net for displaying data
* Adjust module format in the following ways
  * Drop kado.json and move config entries into main module follow
  * Rename module entry point from `index.js` to `kado.js`
  * Kado now scans for `kado.js` files as modules and has no path expectations
* Implement Bootstrap 4 styling
* Implement permission system from auth provider
* Implement navigation breadcrumb system
* Implement language switcher
* Implement default theme
* Release under Lesser GNU Public Licenses 3.0

### 2.1.0
* Add module generator
* Update dependencies

### 2.0.4
* Remove unused nav JSON structure from modules

### 2.0.3
* Fix user space module loading issue

### 2.0.2
* Fix staff handling in admin panel templates

### 2.0.1
* Small fix to template paths

### 2.0.0
* Remove SQLite, CouchDB, Couchbase connectors
* Implement ES6
* Update to latest dependencies
* Drop `user` module and implement more robust `staff` module for default login
* Implement blog cli
* Implement blog api
* Implement complete e2e testing of the system
* Add uri handing to blog module
* Drop `client` interface making core interfaces `admin`,`api`,`main
* Complete `main` interface to display properly

### 1.1.1
* Remove database connectors from dependencies they should be installed at
app build time.

### 1.1.0
* Remove couchdb connector
* Remove couchbase connector
* Fix failure on blog main startup

### 1.0.0
* Initial release
