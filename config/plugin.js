'use strict';

// had enabled by egg
// exports.static = true;
module.exports = {
  mysql: {
    enabled: true,
    package: 'egg-mysql',
  },
  proxyagent: {
    enabled: true,
    package: 'egg-development-proxyagent',
  },
  static: {
    maxAge: 31536000,
    prefix: '/public/',
    enabled: true,
  },
};
