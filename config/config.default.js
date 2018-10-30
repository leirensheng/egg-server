'use strict';

module.exports = appInfo => {
  return {
    keys: appInfo.name + '_1540471238491_9420',
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
    mysql : {
      client: {
        host: '127.0.0.1',
        port: '3306',
        user: 'test_user',
        password: 'test_password',
        database: 'test',
      },
    // proxy: true,
  }
};


// this.ctx.throw(404, msg);


// title: { type: 'string' },
// content: { type: 'string' },
// };
// // 校验参数
// ctx.validate(createRule);


// 反向代理的意思
