# Building a License Server

## Overview

A license server is a simple HTTP server that serves a license file to the application. The application will request the license file from the license server when it starts. If the license is valid, the application will continue to run. If the license is invalid, the application will exit.

This guide will show you not only how to build a license server, but also how to build an administration panel where you can manage the licenses for your application.

## Prerequisites

* Node.js 16 or higher
* Kado 4.5 or higher   

## Step 1: Create a new Kado project
