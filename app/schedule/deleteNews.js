'use strict';
// task 的入参为 ctx，匿名的 Context 实例，可以通过它调用 service 等。
module.exports = {
  schedule: {
    type: 'worker', // 指定所有的 worker 都需要执行
    // 每天00:01执行
    cron: '0 1 0 * * *',
  },
  async task(ctx) {
    if (!ctx.app.databaseIniting) {
      this.app.databaseIniting = true;
      await ctx.service.news.scheduleDelete();
      this.app.databaseIniting = false;
    }
  },
};
