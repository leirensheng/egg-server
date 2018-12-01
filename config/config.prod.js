'use strict';

module.exports = appInfo => {
  return {
    domain: 'http://120.78.173.191',
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

