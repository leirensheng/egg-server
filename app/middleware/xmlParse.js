'use strict';
// const xml = require('./xmlTool');

module.exports = () => {
  return async (ctx, next) => {
    console.log(ctx.is('text/xml'));
    const promise = new Promise(function(resolve, reject) {
      let buf = '';
      ctx.req.setEncoding('utf8');
      ctx.req.on('data', chunk => {
        buf += chunk;
      });
      ctx.req.on('end', () => {
        ctx.helper.xmlToJson(buf)
          .then(resolve)
          .catch(reject);
      });
    });

    await promise.then(result => {
      ctx.req.body = result;
    })
      .catch(e => {
        e.status = 400;
      });
    await next();
  };
};
