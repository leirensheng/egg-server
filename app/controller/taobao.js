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
    const result = await this.service.taobao.searchHandled(this.ctx.query.q, this.ctx.query.page);
    this.ctx.body = result;
  }
  async detail() {
    const results = await this.service.taobao.detail(this.ctx.query.id, this.ctx.query.platform, this.ctx.ip);
    this.ctx.body = {
      data: results[0],
    };
  }
  async getTaokouling() {
    const result = await this.service.taobao.getTaokouling(this.ctx.request.body.url, this.ctx.request.body.text, this.ctx.request.body.logo);
    this.ctx.body = result;
  }
}

module.exports = TaobaoController;

