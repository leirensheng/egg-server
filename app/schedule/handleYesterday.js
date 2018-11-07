'use strict';
// 刚过了一天，可以整理昨天的了，把多余的条数删除
module.exports = {
  schedule: {
    type: 'worker', // 指定所有的 worker 都需要执行
    // 每天0点执行
    cron: '0 0 0 * * *',
  },
  async task(ctx) {
    if (!ctx.app.databaseIniting) {
      ctx.app.databaseIniting = true;
      try {
        const result = await ctx.service.news.handleYesterday();
        ctx.logger.info(Object.assign({ event: 'handleYesterday' }, result));
      } catch (e) {
        ctx.logger.info({ event: 'handleYesterday', err: e });
      }
      ctx.app.databaseIniting = false;
    }
  },
};
