# Nasqueron infrastructure servers website

## Goal

The Nasqueron Infrastructure web site documents our infrastructure servers
and operations.

## Content

This site is a front-end for the different microservices
documenting our infrastructure.

It so offer static HTML/JS/CSS pages to query the microservices API.

Currently, it gives access to:

- Servers log: actions done by Nasqueron Operations SIG members on the infra

## Based on ZURB Template

This work is based on the ZURB Template to create static sites with Foundation.

It offers the following features:

- Handlebars HTML templates with Panini
- Sass compilation and prefixing
- JavaScript module bundling with webpack
- Built-in BrowserSync server
- For production builds:
  - CSS compression
  - JavaScript compression
  - Image compression

## Installation

To install this site:

```
$ git clone https://devcentral.nasqueron.org/source/infra-www.git
```

Then open the folder in your command line, and install the needed dependencies:

```bash
cd infra-www
npm install
```

Finally, run `npm start` to run Gulp. Your finished site will be created in a
folder called `dist`, viewable at this URL:

```
http://localhost:8000
```

To create compressed, production-ready assets, run `npm run build`.

For Nasqueron, this is done by a Jenkins CD task.
