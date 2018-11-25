'use strict';

const Controller = require('egg').Controller;

class WeixinController extends Controller {
  async weixinCheck() {
    console.log('0');
    const result = this.service.weixin.check(this.ctx.request.body.signature, this.ctx.request.body.timestamp, this.ctx.request.body.nonce, this.ctx.request.body.echostr);
    this.body = result;
  }
}

module.exports = WeixinController;

