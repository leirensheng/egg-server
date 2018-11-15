'use strict';
const Service = require('egg').Service;
const moment = require('moment');
const fs = require('fs');
const path = require('path');


class NewsService extends Service {
  async initGoods() {
    const data = await this.getGoods();
    const result = await this.insertGoods(data);
    console.log(result);
  }

  async insertGoods(arrayData, status = 1) {
    const result = await this.app.mysql.beginTransactionScope(async conn => {
      if (status === 1) {
        await conn.query('truncate table goods');
      }
      await conn.insert('goods', arrayData);
      // this.app.currentOrder = arrayData.slice(-1)[0].order;
      return { success: true };
    }, this.ctx);
    return result;


  }

  async getGoods() {
    const { data } = await this.ctx.curl('https://m.smzdm.com/ajax_home_list_show?timesort=' + Date.now(), { dataType: 'json' });
    const date = moment().format('YYYYMMDD');
    const pathForPic = path.resolve(__dirname, `../public/${date}`);
    // todo:定期删图片
    if (!fs.existsSync(pathForPic)) {
      fs.mkdirSync(pathForPic);
    }
    return data.data.filter(one => one.article_mall).map(one => {
      const img = one.article_pic.split('/').slice(-1)[0];
      this.ctx.curl(one.article_pic, {
        writeStream: fs.createWriteStream(path.join(pathForPic, img)),
      });
      return {
        comment: one.article_comment,
        content: one.article_content,
        date: one.article_date,
        mall: one.article_mall,
        priceDesc: one.article_price,
        title: one.article_title,
        pic: `${this.config.domain}:7001/public/${date}/` + img,
        url: one.article_mall_url,
      };
    }).reverse();
  }

  async getGoodsFromDb(length = 10, lastId) {
    let sql;
    let params;
    if (lastId) {
      sql = 'select * from goods where id<? order by id desc limit ? ';
      params = [ lastId, length ];
    } else {
      sql = 'select * from goods  order by id desc limit ? ';
      params = [ length ];
    }
    const result = await this.app.mysql.query(sql, params);
    return {
      data: result,
      length: result && result.length,
    };
    console.log(result);
  }
}

module.exports = NewsService;
