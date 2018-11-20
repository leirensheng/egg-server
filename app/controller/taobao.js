'use strict';

const Controller = require('egg').Controller;

class TaobaoController extends Controller {
  async get() {
    await this.service.taobao.getItem();
  }
  async getConpon() {
    await this.service.taobao.getConpon();
  }

  async search() {
    const result = await this.service.taobao.search(this.ctx.query.q, this.ctx.query.page);
    this.ctx.body = result;
  }

}

module.exports = TaobaoController;

