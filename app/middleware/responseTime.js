'use strict';
module.exports = () => {
  return async function responseTime(ctx, next) {
    const start = Date.now();
    // 注意，和 generator function 格式的中间件不同，此时 next 是一个方法，必须要调用它
    await next();
    const delta = Math.ceil(Date.now() - start);
    ctx.set('X-Response-Time', delta + 'ms');
  };
};
// middleware 中 this 就是 ctx，例如 this.cookies.get('foo')。
