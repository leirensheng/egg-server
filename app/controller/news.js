'use strict';

const Controller = require('egg').Controller;

class NewsController extends Controller {
  async get() {
    // 进入首页加载时候就记录一次
    if (!this.ctx.query.lastId) {
      this.logger.info(this.ctx.helper.getIp());
      this.logger.info(this.ctx.helper.parserUa(this.ctx.headers['user-agent']));
    }
    const dataHandled = await this.ctx.service.news.getNewsFromDb(this.ctx.query.length - 0, this.ctx.query.lastId - 0);
    this.ctx.body = dataHandled;
  }
  async initNews() {
    this.app.databaseIniting = true;
    let logData = {
      event: 'initNews',
    };
    let result;
    try {
      result = await this.ctx.service.news.initNews();
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

