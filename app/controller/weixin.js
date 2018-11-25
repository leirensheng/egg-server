'use strict';

const Controller = require('egg').Controller;

class WeixinController extends Controller {
  async weixinCheck() {
    console.log('0');
    const result = this.service.weixin.check(this.ctx.request.query.signature, this.ctx.request.query.timestamp, this.ctx.request.query.nonce, this.ctx.request.query.echostr);
    this.body = result;
  }
}

module.exports = WeixinController;

