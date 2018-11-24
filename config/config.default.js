'use strict';

module.exports = appInfo => {
  return {
    keys: appInfo.name + '_1540471238491_9420',
    security: {
      csrf: {
        enable: false,
        ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      },
    },
    domain: 'http://127.0.0.1',
    taobaoTestApi: 'http://gw.api.tbsandbox.com/router/rest',
    taobaoServerApi: 'http://gw.api.taobao.com/router/rest',
    appKey: '25287605',
    appSecret: 'e0efd0e6b6ce607a5c9c1b31a4a4bf9a',
    publicDataWithoutTime: {
      app_key: '25287605',
      sign_method: 'hmac',
      format: 'json',
      v: '2.0',
      simplify: 'true',
    },
    countPerDay: 15, // 每天15条
    daysBefore: 15, // 拿知道出现15条前的数据
    middleware: [ 'robot', 'responseTime', 'gzip' ],
    cors: {
      origin: '*',
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    },
    gzip: {
      threshold: 1024,
    },
    bodyParser: {
      jsonLimit: '1mb',
      formLimit: '1mb',
    },
    robot: {
      ua: [ /Baiduspider/i ],
    },
    mysql: {
      client: {
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: 'Abc123456',
        database: 'web',
      },
      proxy: true,
    },
  };
};

// this.ctx.throw(404, msg);
// ctx.logger.debug('debug info');
// ctx.logger.info('some request data: %j', ctx.request.body);
// ctx.logger.warn('WARNNING!!!!');

// // 错误日志记录，直接会将错误日志完整堆栈信息记录下来，并且输出到 errorLog 中
// // 为了保证异常可追踪，必须保证所有抛出的异常都是 Error 类型，因为只有 Error 类型才会带上堆栈信息，定位到问题。
// ctx.logger.error(new Error('whoops'));
