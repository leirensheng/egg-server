'use strict';

const Controller = require('egg').Controller;

class WeixinController extends Controller {
  async weixinCheck() {
    const result = this.service.weixin.check(this.ctx.request.query.signature, this.ctx.request.query.timestamp, this.ctx.request.query.nonce, this.ctx.request.query.echostr);
    this.ctx.body = result;
  }
  async dataFromWx() {
    console.log('body', this.ctx.req.body);
    const {
      MsgType,
      ToUserName,
      FromUserName,
      Content,
    } = this.ctx.req.body;
    if (MsgType === 'text') {
      // let resContent = Content;
      let resObj = {
        MsgType: 'text',
        Content: '欢迎',
      };
      const regexp = /(￥.*￥)/ig;
      const matchRes = regexp.exec(Content);
      if (matchRes && matchRes[1]) {
        const item = await this.ctx.service.weixin.getTaokoulingDetail(matchRes[1]);
        if (item) {
          resObj = {
            MsgType: 'news',
            ArticleCount: 1,
            Articles: {
              item,
            },
          };
        } else {
          resObj = {
            MsgType: 'text',
            Content: '无优惠券',
          };
        }
      }
      const resXml = {
        xml: {
          ToUserName: FromUserName,
          FromUserName: ToUserName,
          CreateTime: Date.now(),
          ...resObj
        },
      };
      console.log(this.ctx.helper.jsonToXml(resXml))
      this.ctx.set('Content-Type', 'text/xml');
      this.ctx.body = this.ctx.helper.jsonToXml(resXml);
    } else {
      this.ctx.body = 'success';
    }
  }
}

module.exports = WeixinController;
