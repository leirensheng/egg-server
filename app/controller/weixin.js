'use strict';

const Controller = require('egg').Controller;

class WeixinController extends Controller {
  async weixinCheck() {
    const result = this.service.weixin.check(this.ctx.request.query.signature, this.ctx.request.query.timestamp, this.ctx.request.query.nonce, this.ctx.request.query.echostr);
    this.ctx.body = result;
  }
  dataFromWx() {
    console.log('body', this.ctx.req.body);
    const {
      MsgType,
      ToUserName,
      FromUserName,
      Content,
    } = this.ctx.req.body;
    if (MsgType === 'event') {

    } else if (MsgType === 'text') {
      const resXml = {
        xml: {
          ToUserName: FromUserName,
          FromUserName: ToUserName,
          CreateTime: Date.now(),
          MsgType: 'text',
          Content,
        },
      };
      this.ctx.set('Content-Type', 'text/xml');
      this.ctx.body = this.ctx.helper.jsonToXml(resXml);
    }
  }
  async test() {
    const a = {
      a: 2,
      b: 3,
    };
    // xml = ;
    this.ctx.set('content-type', 'text/xml; charset=utf-8');
    // this.ctx.body = builder.buildObject(a);
    this.ctx.body = this.ctx.helper.replyText({
      ToUserName: 'body.FromUserName',
      FromUserName: 'body.ToUserName',
      // CreateTime: +new Date(),
      MsgType: 'text',
      Content: 'body.Content[0]',
    });
  }
}

module.exports = WeixinController;
