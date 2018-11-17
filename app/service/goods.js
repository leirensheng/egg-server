'use strict';
const Service = require('egg').Service;
const moment = require('moment');
const fs = require('fs');
const path = require('path');


class NewsService extends Service {
  async initGoods() {
    console.log();
    const data = await this.loopGet([], moment().subtract(1, 'day').unix(), moment().unix());
    // todo: 保证图片和数据库一致性
    const dataHandled = await this.handleData(data);
    dataHandled.reverse();
    return await this.insertGoods(dataHandled);
  }

  async insertGoods(arrayData, status = 1) {
    const result = await this.app.mysql.beginTransactionScope(async conn => {
      if (status === 1) {
        await conn.query('truncate table goods');
      }
      await conn.insert('goods', arrayData);
      // this.app.currentOrder = arrayData.slice(-1)[0].order;
      return {
        success: true,
      };
    }, this.ctx);
    return result;
  }

  async getGoods(starTime = Date.now(), noHandled = false) {
    const {
      data,
    } = await this.ctx.curl('https://www.smzdm.com/youhui/json_more?timesort=' + starTime, {
      dataType: 'json',
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Mobile Safari/537.36',
        Referer: 'https://www.smzdm.com',
      },
    });
    const resData = data.filter(one => [ '天猫', '淘宝', '天猫精选', '聚划算' ].includes(one.article_mall));
    return noHandled ? resData : this.handleData(resData);
  }

  async handleData(data) {
    const date = moment().format('YYYYMMDD');
    const pathForPic = path.resolve(__dirname, `../public/${date}`);
    // todo:定期删图片, 添加时删除掉？
    if (!fs.existsSync(pathForPic)) {
      fs.mkdirSync(pathForPic);
    }


    return data.map(one => {
      const img = one.article_pic.split('/').slice(-1)[0];
      this.ctx.curl(one.article_pic, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Mobile Safari/537.36',
          Referer: 'https://www.smzdm.com',
          timeout: 10000,
        },
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
    });
  }

  async loopGet(allData, limitTime, startTime) {
    const arrayData = await this.getGoods(startTime, true);
    allData = [ ...allData, ...arrayData ];
    const tempLastTime = arrayData.slice(-1)[0].timesort;
    if (limitTime > tempLastTime) {
      return allData;
    }
    return await this.loopGet(allData, limitTime, tempLastTime);
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
  }
}

module.exports = NewsService;
