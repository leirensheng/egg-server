'use strict';
// task 的入参为 ctx，匿名的 Context 实例，可以通过它调用 service 等。
module.exports = {
  schedule: {
    interval: '40min', // 1 分钟间隔
    type: 'worker', // 指定所有的 worker 都需要执行
    // 每三小时准点执行一次
    //  cron: '0 0 */3 * * *',
  },
  async task(ctx) {
    console.log('--------check-------------', ctx.app.currentOrder);
    if (!ctx.app.currentOrder) {
      ctx.app.currentOrder = 80358;
    }
    ctx.service.news.checkNews(ctx.app.currentOrder);
    // console.log(arrData);
    // ctx.app.lastOrder = arrData.slice(-1)[0].order;
  },
};
