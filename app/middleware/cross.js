'use strict';

module.exports = options => {
  return async function gzip(ctx, next) {
    await next();
    ctx.set('Access-Control-Allow-Origin', '*');
  };

};
