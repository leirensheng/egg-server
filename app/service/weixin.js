'use strict';

const Service = require('egg').Service;


class WeixinService extends Service {
  check(signature, timestamp, nonce, echostr) {
    // console.log('in', this.ctx.query.signature);
    console.log(signature, timestamp, nonce, echostr);
    const token = '25287605';
    const list = [ token, timestamp, nonce ];
    list.sort();
    const result = this.ctx.helper.md50(list.join(''));
    if (result == '3jem95CDKxfBI98Csk1gSGnCMwiT0X43Uwcd2OewPln') {
      return echostr;
    }
    return '';
  }
}

module.exports = WeixinService;
