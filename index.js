const path = require('path');
const fs = require('fs');
const sourceMappingURL = require('source-map-url');

class HtmlInlinePlugin {
  constructor(options) {
    isObject(options) || (options = {});

    if (!isObject(options.inline)) {
      if (options.hasOwnProperty('inline')) {
        let inline = isRegExp(options.inline) ? options.inline : !!options.inline;
        options.inline = { js: inline, css: inline };
      }
      else options.inline = { js: true, css: true };
    }
    else {
      options.inline.js = isRegExp(options.inline.js) ? options.inline.js : !!options.inline.js;
      options.inline.css = isRegExp(options.inline.css) ? options.inline.css : !!options.inline.css;
    }

    this.outDir = '';
    this.inlineAsserts = [];
    this.options = Object.assign({ remove: true }, options);
  }
  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      this.outDir = compilation.outputOptions.path;
      compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData, callback) => {
        if (!this.options.inline.css && !this.options.inline.js) {
          return callback(null, htmlPluginData);
        }

        callback(null, this.processTags(compilation, htmlPluginData));
      });
    });

    compiler.plugin('done', compilation => {
      // remove inlined files
      if (this.options.remove) this.removeInlineAsserts();
    })
  }

  processTags(compilation, pluginData) {
    pluginData.head = pluginData.head.map(tag => {
      let assetUrl = tag.attributes.href;
      if (this.testAssertName(assetUrl, this.options.inline.css)) {
        tag = { tagName: 'style', closeTag: true };
        this.updateTag(tag, assetUrl, compilation);
      }

      return tag;
    });
    pluginData.body = pluginData.body.map(tag => {
      let assetUrl = tag.attributes.src;
      if (this.testAssertName(assetUrl, this.options.inline.js)) {
        tag = { tagName: 'script', closeTag: true };
        this.updateTag(tag, assetUrl, compilation);
      }

      return tag;
    });

    return pluginData;
  }

  updateTag(tag, assetUrl, compilation) {
    let publicUrlPrefix = compilation.outputOptions.publicPath || '';
    let assetName = path.posix.relative(publicUrlPrefix, assetUrl);
    let asset = compilation.assets[assetName];

    let source = asset.source();
    if (typeof source !== 'string') {
      source = source.toString();
    }

    // remove sourcemap comments
    tag.innerHTML = sourceMappingURL.removeFrom(source);

    // mark inlined asserts which will be deleted lately
    this.inlineAsserts.push(assetName);

    return tag;
  }

  testAssertName(assetName, option) {
    return option instanceof RegExp ? option.test(assetName) : option;
  }

  removeInlineAsserts() {
    if (!this.outDir) return;

    this.inlineAsserts.forEach(file => {
      let filePath = path.join(this.outDir, file);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      rmdirSync(this.outDir, file);
    })
  }
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
}
function rmdirSync(outDir, file) {
  file = path.join(file).split(path.sep);
  file.pop();

  if (!file.length) return;

  file = file.join(path.sep);
  let dirPath = path.join(outDir, file);

  if (fs.existsSync(dirPath)) {
    let files = fs.readdirSync(dirPath);

    if (!files.length) {
      fs.rmdirSync(dirPath);
    }
  }
  rmdirSync(outDir, file);
}

module.exports = HtmlInlinePlugin;