'use strict';
// task 的入参为 ctx，匿名的 Context 实例，可以通过它调用 service 等。
module.exports = {
  schedule: {
    interval: '1m', // 1 分钟间隔
    type: 'all', // 指定所有的 worker 都需要执行
    // 每三小时准点执行一次
    //  cron: '0 0 */3 * * *',
  },
  async task(ctx) {
    const res = await ctx.curl('http://www.api.com/cache', {
      dataType: 'json',
    });
    ctx.app.cache = res.data;
  },
};
