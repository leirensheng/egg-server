'use strict';

const Service = require('egg').Service;
const moment = require('moment');


class TaobaoService extends Service {

  async getItem() {
    const realData = {
      method: 'taobao.tbk.item.get',
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

    this.ctx.helper.curl2(realData)
      .then(res => {
        console.log(res.data);
      });
    // await this.service.getItem();
  }

  async search(q = 'iPhone', page_no = 1) {
    const realData = {
      method: 'taobao.tbk.dg.material.optional',
      page_no,
      adzone_id: '60925450088',
      is_overseas: false,
      has_coupon: true,
      sort: 'tk_total_sales_des', // 排序_des（降序），排序_asc（升序），销量（total_sales），淘客佣金比率（tk_rate）， 累计推广量（tk_total_sales），总支出佣金（tk_total_commi），价格（price）
      q,
    };
    const { data } = await this.ctx.helper.curl2(realData);
    console.log(data);
    return this.handleTbSearch(data);
  }
  async handleTbSearch(data) {
    return data.result_list.map(one => {
      const reg = /(\d*)元$/g;
      const conpon = reg.exec(one.coupon_info)[1];
      return {
        volumn: one.volume,
        content: '',
        conpon: conpon + '元',
        conponLeft: one.coupon_remain_count,
        mall: one.user_type === 1 ? '天猫' : '淘宝',
        pic: one.pict_url,
        priceDesc: `券后价：${one.zk_final_price - conpon}元`,
        title: one.title,
        url: one.coupon_share_url,
      };
    });
  }

  async getConpon() {
    const realData = {
      method: 'taobao.tbk.coupon.get',
      item_id: '566352435732',
    };
    this.ctx.helper.curl2(realData)
      .then(res => {
        console.log(res.data);
      });
  }
}

module.exports = TaobaoService;
