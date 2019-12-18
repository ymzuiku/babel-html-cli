/**
 * cli helper
 */
exports.cliHelper = argv => {
  // math args
  let inputHtml = argv[0];
  let babelrcFileName = '.html-babelrc';
  let outHtml = argv[1];

  const matchs = {
    '--config': v => (babelrcFileName = v),
    '--out': v => (outHtml = v),
    '--input': v => (inputHtml = v),
  };

  argv.forEach((v, i) => {
    if (v === '--version') {
      console.log(require('./package.json').name, require('./package.json').version);
      process.exit(0);
    }
    if (v === '--help') {
      console.log('--config ', 'Set bablerc to babel-html, defalut is .html-babelrc');
      console.log('--input  ', 'Set input html, example: public/index-es6.html');
      console.log('--out    ', 'Set out html, example: public/index.html');
      console.log(' ');

      console.error('Example: babel-html public/index-es6.html -o public/index.html');
      console.log(' ');
      process.exit(0);
    }
    const param = argv[i + 1];
    if (param && matchs[v]) {
      matchs[v](param);
    }
  });

  function exitLog() {
    console.error('Example: babel-html public/index-es6.html -o public/index.html');
    console.log('[ERROR] Stop babel-html!');
    process.exit(1);
  }

  if (!outHtml || outHtml.indexOf('.html') === -1) {
    console.error("[ERROR] Please set '-o' set out html file path");
    exitLog();
  } else if (!inputHtml || inputHtml.indexOf('.html') === -1) {
    console.error('[ERROR] Please input html file at args[0]');
    exitLog();
  }

  return {
    babelrcFileName,
    inputHtml,
    outHtml,
  };
};
