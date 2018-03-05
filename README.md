Inline source extension for the HTML Webpack Plugin
========================================

This is an extension plugin for the [webpack](http://webpack.github.io) plugin [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin).  It allows you to embed javascript and css source inline.

Installation
------------

Install the plugin with npm:
```shell
$ npm install --save-dev html-inline-plugin
```

Basic Usage
-----------
Require the plugin in your webpack config:

```javascript
const HtmlInlinePlugin = require('html-inline-plugin');
```

Add the plugin to your webpack config as follows:

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlInlinePlugin()
]
```


Options
-------
The available options are:

- `inline`: `boolean` or `regexp` or `object`

  Determines how to inline asserts. The following option are all vaild.

  - `inline: true`
  - `inline: /\.(css|js)$/`
  - `inline: {
      css: /\.css$/,
      js: /\.js$/
    }`
  - `inline: {
      css: true,
      js: true
    }`

  Default is `true`.

- `remove`: `boolean`

  Removes the inlined files. Default is `true`.