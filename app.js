'use strict';
module.exports = app => {
  app.beforeStart(async () => {
    app.cache = {
      // wxTokenWillExpired: 700,
    };
  });
};
