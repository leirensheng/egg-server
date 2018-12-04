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


  async getFourDimention(q, page_no) {
    const sorts = [ 'total_sales_des', 'price_asc', 'tk_total_sales_des', 'tk_rate' ];
    const resultArray = await Promise.all(sorts.map(one => this.search(q, one, page_no)));
    const allData = resultArray.reduce((prev, cur) => {
      if (cur) {
        return [ ...prev, ...cur ];
      }
      return prev;
    }, []);
    const ids = new Set(allData.map(one => one.num_iid));
    return this.handleTbSearch(allData, ids);
  }


  //  获取不到的话就切词获取
  async loopGetData(q, page_no) {
    // const keywordLength = 5;
    const data = await this.getFourDimention(q, page_no);
    console.log('淘宝查询完毕');
    if (!data.length) {
      console.log('空');
      // 如果剩下的可以处理的关键词为0，返回空
      if (Array.isArray(this.ctx.keywords) && !this.ctx.keywords.length) {
        return [];
      }
      // 没有关键词，就获取一次，截取7个
      if (!this.ctx.keywords && q) {
        const keywordsArr = await this.getKeywords(q);
        const keywords = keywordsArr.map(one => one.t);
        console.log('请求接口切词', keywords);
        this.ctx.keywords = keywords.slice(0, 8);
      }
      //  有关键词了，请求接口
      const curKeyword = this.ctx.keywords.join(' ');
      console.log('关键词', curKeyword);
      this.ctx.keywords.pop();
      return await this.loopGetData(curKeyword, page_no);
    }
    return data;
  }

  async searchHandled(q, page_no) {
    const data = await this.loopGetData(q, page_no);
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

  async search(q = 'iPhone', sort = 'total_sales_des', page_no = 1, has_coupon = true) {
    const realData = {
      method: 'taobao.tbk.dg.material.optional',
      page_no,
      adzone_id: '60925450088',
      has_coupon,
      sort, // 销量（total_sales），淘客佣金比率（tk_rate）， 累计推广量（tk_total_sales），总支出佣金（tk_total_commi），价格（price）
      q,
    };
    const {
      data,
    } = await this.ctx.helper.curl2(realData);
    return data.result_list;
  }

  async detail(num_iids, platform = 2, ip = this.ctx.ip) {
    const realData = {
      method: 'taobao.tbk.item.info.get',
      num_iids,
      platform,
      ip,
    };
    const {
      data,
    } = await this.ctx.helper.curl2(realData);
    // console.log(data);
    return data.results;
  }

  handleTbSearch(data, ids) {
    let sum = 0;
    const uniqueData = data.filter(one => {
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
      sum = sum + Number(finalPrice);
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
        id: one.num_iid,
      };
    });
    const tooLowPrice = sum / (uniqueData.length) * 0.1;
    console.log('价格阈值', tooLowPrice, 'uniqueData', uniqueData.length);
    return uniqueData.filter(one => one.finalPrice >= tooLowPrice);
  }

  async getTaokoulingDetail(kouling) {
    const res = await this.ctx.service.taobao.translateTaokouling(kouling);
    if (res && res.has_coupon) {
      const reg = /(\d*)元$/g;
      const coupon = reg.exec(res.coupon_info)[1];
      const [ detail ] = await this.ctx.service.taobao.detail(res.item_id);
      const finalPrice = detail.zk_final_price - coupon;
      return {
        conpon: coupon + '元',
        finalPrice,
        priceDesc: '券后价：' + finalPrice + '元',
        url: res.short_url,
        pic: detail.pict_url,
        mall: detail.user_type ? '天猫' : '淘宝',
        title: detail.title,
        volume: detail.volume,
        id: res.item_id,
      };
    }
    return '';
  }
  async getKeywords(str) {
    const {
      data,
    } = await this.app.curl(`http://api.pullword.com/get.php?source=${encodeURIComponent(str)}&param1=0&param2=1&json=1`, {
      dataType: 'json',
    });
    console.log(data.toString());
    return JSON.parse(data.toString()).sort((a, b) => b.p - a.p);
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
    const {
      data,
    } = await this.ctx.helper.curl2(realData);
    return data;
  }
  async getRecommends(ids) {
    for (const id of ids) {
      const recommendData = await this.getRecommend(id);
      if (recommendData) {
        // return this.handleRecommendData(recommendData);
      }
    }
  }
  // handleRecommendData(data) {
  //   return data.map(one => ({
  //     volume: one.volume,
  //     content: '',
  //     shop_dsr: one.shop_dsr,
  //     conpon: conpon + '元',
  //     finalPrice,
  //     tkRate: one.commission_rate,
  //     profit: one.commission_rate * finalPrice / 10000,
  //     conponLeft: one.coupon_remain_count,
  //     mall: one.user_type === 1 ? '天猫' : '淘宝',
  //     pic: one.pict_url,
  //     priceDesc: `券后价：${finalPrice}元`,
  //     title: one.title,
  //     url: one.coupon_share_url,
  //     taobaoUrl: one.url,
  //     id: one.num_iid,
  //   }));
  // }
  async getRecommend(num_iid) {
    const realData = {
      method: 'taobao.tbk.item.recommend.get',
      num_iid,
      fields: 'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url',
    };
    const {
      data: {
        results,
      },
    } = await this.ctx.helper.curl2(realData);
    return results;
  }

  async translateTaokouling(kouling) {
    const {
      data,
    } = await this.app.curl('https://api.open.21ds.cn/apiv1/getitemgyurlbytpwd', {
      dataType: 'json',
      data: {
        apkey: 'c29e9356-c281-e8a1-ba6e-915dee0ab79c',
        tpwdcode: `${kouling}`,
        pid: 'mm_41438501_216300412_60925450088',
        tbname: 'leirensheng',
        shorturl: 1,
        tpwd: 1,
      },
    });
    if (data.code === 200) {
      return data.result.data;
    }
    return '';
  }
  // async getRecommend(user_id) {
  //   const realData = {
  //     method: 'taobao.tbk.shop.recommend.get',
  //     user_id,
  //     fields: 'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url',
  //   };
  //   const { data } = await this.ctx.helper.curl2(realData);
  //   console.log(data);
  //   return data;
  // }

}

module.exports = TaobaoService;
