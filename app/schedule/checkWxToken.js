'use strict';
module.exports = app => {
  // var default = 700
  if (!app.cache) {
    app.cache = {
      wxTokenWillExpired: 700,
    };
  }
  // var interval = app.cache&&app.cache.wxTokenWillExpired? app.cache.wxTokenWillExpired:700
  return {
    schedule: {
      interval: `${(app.cache.wxTokenWillExpired - 10)}s`,
      type: 'worker',
      immediate: true,
      disable: !app.cache.wxTokenWillExpired,
    },
    async task(ctx) {
      app.cache.isWxTokenExpired = true;
      ctx.service.weixin.getTocken();
    },
  };
};
