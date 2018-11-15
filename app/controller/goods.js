'use strict';

const Controller = require('egg').Controller;

class NewsController extends Controller {
  async get() {
    const dataHandled = await this.ctx.service.goods.getGoodsFromDb((this.ctx.query.length || 10) - 0, this.ctx.query.lastId - 0);
    this.ctx.body = dataHandled;
  }
  async initGoods() {
    this.app.databaseIniting = true;
    let logData = {
      event: 'initGoods',
    };
    let result;
    try {
      result = await this.ctx.service.goods.initGoods();
      logData = Object.assign({ success: true }, logData, result);
    } catch (e) {
      logData = Object.assign({ success: false }, logData, { err: e });
    }
    this.ctx.logger.info(logData);
    this.app.databaseIniting = false;
    this.ctx.body = result;
  }

  async test() {
    this.service.news.handleYesterday();
  }
}

module.exports = NewsController;

