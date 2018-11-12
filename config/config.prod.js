'use strict';

module.exports = appInfo => {
  return {
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

