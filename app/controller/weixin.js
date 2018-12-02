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
      let resContent = Content;
      const regexp = /(￥.*￥)/ig;
      const matchRes = regexp.exec(Content);
      if (matchRes && matchRes[1]) {
        const res = await this.ctx.service.taobao.translateTaokouling(matchRes[1]);
        console.log(res);
        if (res && res.has_coupon) {
          resContent =
           `有优惠券
            【优惠券】：${res.coupon_info}
            券类型：${res.coupon_type == 1 ? '公开券' : (res.coupon_type == 2 ? '私有券' : '妈妈券')}
            淘口令：${res.tpwd}
            链接：${res.coupon_click_url}
           `;
        } else {
          resContent = '无优惠券';
        }
      }
      const resXml = {
        xml: {
          ToUserName: FromUserName,
          FromUserName: ToUserName,
          CreateTime: Date.now(),
          MsgType: 'text',
          Content: resContent,
        },
      };
      this.ctx.set('Content-Type', 'text/xml');
      this.ctx.body = this.ctx.helper.jsonToXml(resXml);
    } else {
      this.ctx.body = 'success';
    }
  }
}

module.exports = WeixinController;
