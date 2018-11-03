'use strict';
const isJSON = require('koa-is-json');
const zlib = require('zlib');


module.exports = options => {
  return async function gzip(ctx, next) {
    await next();
    console.log('gzip0', ctx.body);

    // 后续中间件执行完成后将响应体转换成 gzip
    let body = ctx.body;
    if (!body) return;
    if (options.threshold && ctx.length < options.threshold) {
      return;
    }
    if (isJSON(body)) {
      console.log('isjson');
      body = JSON.stringify(body);
    }

    // 设置 gzip body，修正响应头
    const stream = zlib.createGzip();
    stream.end(body);
    ctx.body = stream;
    ctx.set('Content-Encoding', 'gzip');
    ctx.set('Access-Control-Allow-Origin', '*');
  };

};
