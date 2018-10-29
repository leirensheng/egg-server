'use strict';

const Controller = require('egg').Controller;

class NewsController extends Controller {
  async get() {
    const result = await this.ctx.curl('https://api.readhub.cn/topic?lastCursor=&pageSize=20');
    console.log(JSON.stringify(JSON.parse(result.data.toString()), null, 4));
    this.ctx.body = result.data.toString();
  }
}

module.exports = NewsController;
