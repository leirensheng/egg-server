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
    const regexp = /(￥.*￥)/ig;
    const matchRes = regexp.exec(this.ctx.query.q);
    if (matchRes && matchRes[1]) {
      const item = await this.ctx.service.taobao.getTaokoulingDetail(matchRes[1]);
      if (item) {
        this.ctx.body = {
          data: [ item ],
        };
      } else {
        this.ctx.body = {
          data: [],
        };
      }
    } else {
      this.service.taobao.saveSearchWord(this.ctx.query.q);
      const result = await this.service.taobao.searchHandled(this.ctx.query.q, this.ctx.query.page);
      this.ctx.body = result;
    }
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
  async translateTaokouling() {
    const result = await this.service.taobao.translateTaokouling(this.ctx.query.kouling);
    this.ctx.body = result;
  }
  async getRecommend() {
    const result = await this.service.taobao.getRecommend(this.ctx.query.id);
    this.ctx.body = result;
  }
}

module.exports = TaobaoController;

