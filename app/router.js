'use strict';
//  TODO：白名单访问
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const xmlParse = app.middleware.xmlParse();
  // router.get('/', controller.home.index);
  router.get('/getNews', controller.news.get);
  router.get('/getGoods', controller.goods.get);
  router.get('/initNews', controller.news.initNews);
  router.get('/initGoods', controller.goods.initGoods);
  router.get('/tbSearch', controller.taobao.search);
  router.post('/getTaokouling', controller.taobao.getTaokouling);
  router.get('/wx', controller.weixin.weixinCheck);
  router.post('/wx', xmlParse, controller.weixin.dataFromWx);
  router.get('/test', controller.weixin.test);

};
