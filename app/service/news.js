'use strict';
const Service = require('egg').Service;


class NewsService extends Service {

  async get(startOrder = '', cnt = 20, noHandle = false) {
    console.log('获取----------', startOrder);
    const res = await this.ctx.curl(`https://api.readhub.cn/topic?lastCursor=${startOrder}&pageSize=${cnt}`, { dataType: 'json' });
    const resData = res.data;
    if (resData.data.length) {
      if (noHandle) {
        return resData.data;
      }
      return this.handleData(resData.data);
    }
    return [];
  }

  async handleData(data) {
    return data.map(one => {
      return {
        title: one.title,
        order: one.order,
        oldid: one.id,
        updateDate: one.updatedAt,
        createDate: one.createdAt,
        publishDate: one.publishDate,
        stars: Math.ceil(Math.random() * 100 + 1),
        text: one.summary,
        keyword: one.nelData.result.map(one => one.entityName).join(','),
        relations: one.newsArray.map(oneRelation => {
          return {
            id: oneRelation.id,
            articleId: one.id,
            title: oneRelation.title,
            url: oneRelation.url,
            mobileUrl: oneRelation.mobileUrl,
            author: oneRelation.autherName,
            publishDate: oneRelation.publishDate,
            source: oneRelation.siteName,
          };
        }),
        date: one.date || one.createdAt.split('T')[0],
      };
    });
  }

  async getNewsFromNet() {
    const arrayData = await this.get();
    console.log(arrayData);
    const dateCategories = [ ...new Set(arrayData.map(one => one.date).sort((a, b) => a - b)) ];

    return dateCategories.map(oneDate => {
      return {
        type: 'article',
        date: oneDate,
        weekDay: this.ctx.helper.getWeekDay(new Date(oneDate)),
        data: arrayData.filter(one => one.date === oneDate),
      };
    });
  }


  async loopGet(allData, limitDate, startOrder) {
    const arrayData = await this.get(startOrder, 20, true);
    allData = [ ...allData, ...arrayData ];
    const oldestDay = arrayData.slice(-1)[0].createdAt.split('T')[0];
    if (oldestDay === limitDate) {
      return allData;
    }
    return await this.loopGet(allData, limitDate, arrayData.slice(-1)[0].order);
  }

  async onlyGetSome(allData, oneDateLength) {
    allData.forEach(one => { one.date = one.createdAt.split('T')[0]; });
    const dates = [ ...new Set(allData.map(one => one.date)) ];
    const result = [];
    dates.forEach(oneDate => {
      const oneDayData = allData.filter(one => one.date === oneDate);
      const gap = Math.floor(oneDayData.length / oneDateLength);
      result.push(...oneDayData.filter((one, index) => index % gap === 0));
    });
    // 保证获取的第一条总是存到数据库以支持更新
    if (result.every(one => one.order !== allData.slice(-1)[0].order)) {
      result.push(...allData.slice(-1));
    }
    return this.handleData(result);
  }

  async initNews(limitDate = '2018-10-15') {
    let allData = await this.loopGet([], limitDate, '');
    allData.reverse();
    allData = await this.onlyGetSome(allData, 15);
    return await this.insertNews(allData, true);
  }

  async test() {

  }
  async insertNews(arrayData, needDeleteFirst) {
    const relationData = [];
    const insertArr = arrayData.map(one => {
      const obj = {
        order: one.order,
        updateDate: one.updateDate,
        publishDate: one.publishDate,
        createDate: one.createDate,
        text: one.text,
        title: one.title,
        stars: one.stars,
        oldid: one.oldid,
        keyword: one.keyword,
      };
      if (one.relations && one.relations.length) {
        relationData.push(...one.relations.slice(0, 2));
      }
      return obj;
    });
    const result = await this.app.mysql.beginTransactionScope(async conn => {
      if (needDeleteFirst) {
        await conn.query('truncate table article');
        await conn.query('truncate table relation');
      }
      await conn.insert('article', insertArr);
      await conn.insert('relation', relationData);
      return { success: true };
    }, this.ctx);
    return result;
  }

  async checkNews(order) {
    const res = await this.ctx.curl(`https://api.readhub.cn/topic/newCount?latestCursor=${order}`, { dataType: 'json' });
    return res.data;
  }

  async update(count) {
    this.app.databaseIniting = true;
    const arrayData = await this.get(this.app.currentOrder, count);
    await this.insertNews(arrayData);
    this.app.databaseIniting = false;
  }

  async scheduleDelete() {
    const targetDate = new Date();
    targetDate.setDate(new Date().getDate() - 14);
    this.app.databaseIniting = true;
    await this.app.mysql.beginTransactionScope(async conn => {
      await conn.query('delete from article where createDate < ?', [ targetDate ]);
      await conn.query('delete from relation where publishDate < ?', [ targetDate ]);
      return { success: true };
    }, this.ctx);
    this.app.databaseIniting = false;
  }
}

module.exports = NewsService;
