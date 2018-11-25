'use strict';

const Service = require('egg').Service;


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

  async searchHandled(q, page_no) {
    const sorts = [ 'total_sales_des', 'price_asc', 'tk_total_sales_des', 'tk_rate' ];
    const [ a, b, c, d ] = await Promise.all(sorts.map(one => this.search(q, one, page_no)));
    const data = this.handleTbSearch([ ...a, ...b, ...c, ...d ]);
    const maxSales = Math.max(...(data.map(one => one.volume)));
    const minPrice = Math.min(...(data.map(one => one.finalPrice)));
    const maxFen = Math.max(...(data.map(one => one.shop_dsr)));
    const maxProfit = Math.max(...(data.map(one => one.profit)));


    data.forEach(one => {
      one.weight = one.volume / maxSales * 40 + minPrice / one.finalPrice * 30 + one.shop_dsr / maxFen * 20 + one.profit / maxProfit * 8;
    });

    data.sort((a, b) => {
      return b.weight - a.weight;
    });
    return {
      data,
      maxSales,
      minPrice,
      maxFen,
      maxProfit,
    };
  }

  async search(q = 'iPhone', sort = 'total_sales_des', page_no = 1) {
    const realData = {
      method: 'taobao.tbk.dg.material.optional',
      page_no,
      adzone_id: '60925450088',
      is_overseas: false,
      has_coupon: true,
      sort, // 销量（total_sales），淘客佣金比率（tk_rate）， 累计推广量（tk_total_sales），总支出佣金（tk_total_commi），价格（price）
      q,
    };
    const { data } = await this.ctx.helper.curl2(realData);
    return data.result_list;
  }

  handleTbSearch(data) {
    const ids = new Set(data.map(one => one.num_iid));
    return data.filter(one => {
      if (ids.delete(one.num_iid)) {
        return one.volume;
      }
      return false;
    }).map(one => {
      const reg = /(\d*)元$/g;
      const conpon = reg.exec(one.coupon_info)[1];

      let finalPrice = one.zk_final_price - conpon;

      if (/\d\.\d{3,}$/.test(finalPrice)) {
        finalPrice = finalPrice.toFixed(2);
      }
      return {
        volume: one.volume,
        content: '',
        shop_dsr: one.shop_dsr,
        conpon: conpon + '元',
        finalPrice,
        tkRate: one.commission_rate,
        profit: one.commission_rate * finalPrice / 10000,
        conponLeft: one.coupon_remain_count,
        mall: one.user_type === 1 ? '天猫' : '淘宝',
        pic: one.pict_url,
        priceDesc: `券后价：${finalPrice}元`,
        title: one.title,
        url: one.coupon_share_url,
        taobaoUrl: one.url,
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

  async getTaokouling(url, text, logo) {
    const realData = {
      method: 'taobao.tbk.tpwd.create',
      text,
      url,
      logo,
    };
    const { data } = await this.ctx.helper.curl2(realData);
    return data;
  }
}

module.exports = TaobaoService;
