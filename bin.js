#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const pwd = (...args) => path.resolve(process.cwd(), ...args);
const argv = process.argv.splice(2);

const babel = require('@babel/core');
const cheerio = require('cheerio');
const { cliHelper } = require('./cli');
// math args
const { babelrcFileName, inputHtml, outHtml } = cliHelper(argv);

console.log('transfrom...');

// babel-react need set NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// create babelOptions
let babelrc = {};
const babelrcPath = pwd(babelrcFileName);
if (fs.existsSync(babelrcPath)) {
  babelrc = fs.readJSONSync(babelrcPath);
}

const babelOpts = {
  presets: [['react-app']],
  sourceType: 'script',
  minified: true,
  ...babelrc,
};

// build html
const html = fs.readFileSync(inputHtml);
const $ = cheerio.load(html);

$('script').each(function(index, xml) {
  let ctx = $(xml).html();
  const windoNodeEnv = xml.attribs['data-babel-env'];
  if (windoNodeEnv) {
    $(xml).html(`
      window.process = {
        env: {
          NODE_ENV: ${JSON.stringify(process.env.NODE_ENV)},
          BABEL_ENV: ${JSON.stringify(process.env.BABEL_ENV)},
          BABEL_HTML: ${JSON.stringify(process.env.BABEL_HTML)},
        },
      };
    `);
  }

  const removeType = xml.attribs['data-babel-remove'];
  if (removeType === 'true' || removeType === process.env.NODE_ENV) {
    $(xml).remove();
  }
  if (ctx) {
    if (xml.attribs['data-babel-keep'] === 'true') {
      return;
    }

    // remove at development or at production
    if (process.env.NODE_ENV !== 'development') {
      ctx = ctx.replace(`return 'at-development';`, '');
    }
    if (process.env.NODE_ENV !== 'production') {
      ctx = ctx.replace(`return 'at-production';`, '');
    }

    let es5;
    try {
      es5 = babel.transform(ctx, {
        filename: `b${index}.js`,
        ...babelOpts,
      });
    } catch (err) {
      // if catch babel error, throw error
      console.log(`[ERROR] at babel:<script [${index}]>`);
      console.log(ctx);
      console.log(err);
      process.exit(1);
    }

    $(xml).html(es5.code);
  }
});

// print out-html
fs.writeFileSync(outHtml, $.html());
console.log(pwd(outHtml));
