'use strict';
//  TODO：白名单访问
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/getNews', controller.news.get);
  router.get('/initNews', controller.news.initNews);
  router.get('/test', controller.news.test);

};
