'use strict';

const Service = require('egg').Service;


class WeixinService extends Service {
  check(signature, timestamp, nonce, echostr) {
    // console.log('in', this.ctx.query.signature);
    console.log(signature, timestamp, nonce, echostr);
    const token = '25287605';
    const list = [ token, timestamp, nonce ];
    list.sort();
    const result = this.ctx.helper.sha1(list.join(''));
    if (result === signature) {
      return echostr;
    }
    return '';
  }
  // async refresh
  async getTocken() {
    if (this.app.cache.wxToken && !this.app.cache.isWxTokenExpired) {
      return this.app.cache.wxToken;
    }
    const {
      data,
    } = await this.app.curl(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.config.wxAppId}&secret=${this.config.wxAppSecret}`, {
      dataType: 'json',
    });
    if (data.errcode) {
      console.log('token更新失败', data.errmsg);
      return '';
    }
    console.log('token更新成功');
    this.app.cache.wxToken = data.access_token;
    this.app.cache.isWxTokenExpired = false;
    this.app.cache.wxTokenWillExpired = data.expires_in;
    return data.access_token;
  }
  async getTaokoulingDetail(kouling) {
    const res = await this.ctx.service.taobao.translateTaokouling(kouling);
    if (res && res.has_coupon) {
      const reg = /(\d*)元$/g;
      const coupon = reg.exec(res.coupon_info)[1];
      const [ detail ] = await this.ctx.service.taobao.detail(res.item_id);
      return {
        Title: detail.title,
        Description: `优惠券：${coupon}元  券后价：${detail.zk_final_price - coupon}元`,
        PicUrl: detail.pict_url,
        Url: `http://m.ixcut.com/detail?data=${encodeURIComponent(JSON.stringify({...res,...detail,id: res.item_id}))}`,
      };
    }
    return '';
  }
}

module.exports = WeixinService;
