'use strict';
module.exports = () => {
  return async function onerror(ctx, next) {
    try {
      await next();
    } catch (err) {
      console.log('------错-------', err);
      ctx.app.emit('error', err);
      ctx.body = 'server error';
      ctx.status = err.status || 500;
    }
  };
};
