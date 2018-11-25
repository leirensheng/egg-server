'use strict';

const Controller = require('egg').Controller;

class WeixinController extends Controller {
  async weixinCheck() {
    const result = this.service.weixin.check(this.ctx.request.query.signature, this.ctx.request.query.timestamp, this.ctx.request.query.nonce, this.ctx.request.query.echostr);
    this.ctx.body = result;
  }
  dataFromWx() {
    console.log('data From Wx', this.ctx.request.body);
    this.ctx.body = '';
  }
  async test() {
    this.ctx.body = await this.service.weixin.getTocken();
  }
}

module.exports = WeixinController;

