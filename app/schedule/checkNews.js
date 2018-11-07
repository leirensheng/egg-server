'use strict';
// task 的入参为 ctx，匿名的 Context 实例，可以通过它调用 service 等。
module.exports = {
  schedule: {
    interval: '1h', // 1 分钟间隔
    type: 'worker', // 指定所有的 worker 都需要执行
    // 每三小时准点执行一次
    //  cron: '0 0 */3 * * *',
  },
  async task(ctx) {
    if (!ctx.app.databaseIniting) {
      if (!ctx.app.currentOrder) {
        ctx.app.databaseIniting = true;
        const [ row ] = await ctx.app.mysql.query('select `order` from article order by `id` desc limit 1');
        if (row && row.order) {
          ctx.app.currentOrder = row.order;
        }
        ctx.app.databaseIniting = false;
      } else {
        console.log(ctx.app.currentOrder);
        const { count } = await ctx.service.news.checkNews(ctx.app.currentOrder);
        console.log('--find----------', count);

        if (count) {
          // 发现有更新，cache设置为过期状态
          ctx.app.isNewsCacheExpired = true;
          ctx.app.databaseIniting = true;
          await ctx.service.news.update(count);
          ctx.app.databaseIniting = false;
        }
      }
    }
  },
};
