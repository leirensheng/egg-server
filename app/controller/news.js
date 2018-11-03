'use strict';

const Controller = require('egg').Controller;

class NewsController extends Controller {
  async get() {
    const dataHandled = await this.ctx.service.news.getNewsFromNet();
    this.ctx.logger.debug('a');
    this.ctx.logger.info('info');
    // this.ctx.logger.error(new Error('e'));

    this.ctx.body = dataHandled;
  }
  async initNews() {

    const result = await this.ctx.service.news.initNews();
    console.log('Controller', result);
    this.ctx.body = result;
  }

  async test() {
    this.service.news.test();
  }
}

module.exports = NewsController;

