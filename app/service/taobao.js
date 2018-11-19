'use strict';

const Service = require('egg').Service;
const moment = require('moment');

class TaobaoService extends Service {

  async getItem() {
    console.log(moment().format('YYYY-MM-DD hh:mm:ss'));
    const publicData = {
      method: 'taobao.tbk.item.get',
      app_key: this.config.appKey,
      sign_method: 'hmac',
      timestamp: moment().format('YYYY-MM-DD hh:mm:ss'),
      format: 'json',
      v: '2.0',
      // simplify: 'true',
    };
    const realData = {
      fields: 'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,seller_id,volume,nick',
      q: 'abc',
      cat: '16,18',
      // itemloc: '杭州',
      // sort: 'tk_rate_des',
      // is_tmall: 'false',
      // is_overseas: 'false',
      // start_price: '10',
      // end_price: '10',
      // start_tk_rate: '123',
      // end_tk_rate: '123',
      // platform: '1',
      // page_no: '123',
      // page_size: '20',
    };
    const sign = this.ctx.helper.getSign(publicData, realData);
    console.log(Object.assign({ sign }, publicData, realData));
    this.app.curl(this.config.taobaoServerApi, {
      data: Object.assign({ sign }, publicData, realData),
      method: 'GET',
      dataType: 'json',
      // contentType: 'json',
    }).then(res => {
      console.log(res.data);
    });
    // await this.service.getItem();
  }

}

module.exports = TaobaoService;

