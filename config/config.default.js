'use strict';

module.exports = appInfo => {
  return {
    keys: appInfo.name + '_1540471238491_9420',
    countPerDay: 15, // 每天15条
    daysBefore: 15, // 拿知道出现15条前的数据
    middleware: [ 'robot', 'responseTime', 'gzip' ],
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
        password: '',
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
