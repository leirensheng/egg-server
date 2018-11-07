'use strict';
const Service = require('egg').Service;
const moment = require('moment');

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

  // 加上點讚數
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


  async loopGet(allData, limitDate, startOrder, step) {
    const arrayData = await this.get(startOrder, step || 20, true);
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

  async initNews(limitDate) {
    let allData = await this.getNewsRecently(limitDate, 20);
    allData = await this.onlyGetSome(allData, 15);
    return await this.insertNews(allData, 1);
  }

  async getNewsRecently(limitDate, step) {
    const defaultDate = moment().subtract(15, 'days').format('YYYY-MM-DD');
    const data = await this.loopGet([], limitDate || defaultDate, '', step);
    data.reverse();
    return data;
  }

  async test() {

  }

  // 插入的顺序arrayData 第一个是距离现在最远的
  // status为1时为初始化，删除所有数据，2 为删除当天数据,並且更新
  async insertNews(arrayData, status) {
    this.app.databaseIniting = true;
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
      if (status === 1) {
        await conn.query('truncate table article');
        await conn.query('truncate table relation');
      } else if (status === 2) {
        const dateStr = moment().format('YYYY-MM-DD');
        const sql = 'delete from article where createDate >= ?';
        const sql2 = 'delete  a from  relation a  join ( select * from article y where createDate >= ?)b on b.oldid=a.articleId';

        // todo: 凌晨处理昨天的
        await conn.query(sql2, [ dateStr ]);
        await conn.query(sql, [ dateStr ]);

      }
      await conn.insert('article', insertArr);
      await conn.insert('relation', relationData);

      this.app.databaseIniting = false;
      this.app.currentOrder = arrayData.slice(-1)[0].order;
      return { success: true };
    }, this.ctx);
    return result;
  }

  async checkNews(order) {
    const res = await this.ctx.curl(`https://api.readhub.cn/topic/newCount?latestCursor=${order}`, { dataType: 'json' });
    return res.data;
  }
  // 获取最新的,並且修改
  async update(count) {
    const arrayData = await this.get('', count);
    arrayData.reverse();
    try {
      await this.insertNews(arrayData);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        this.ctx.logger.info('order Error,refresh...');
        try {
          await this.refreshToday();
          this.ctx.logger.info({ event: 'refresh', status: 'success' });
        } catch (e) {
          this.ctx.logger.info({ event: 'refresh', status: 'fail', err: e });
        }
      }
    }
  }

  async refreshToday() {
    const arrayData = await this.getNewsRecently(moment().subtract(1, 'day').format('YYYY-MM-DD'), 1);
    const data = await this.handleData(arrayData);
    return await this.insertNews(data, 2);
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

  async formatNews(data) {
    const articleIds = [ ... new Set(data.map(one => one.id)) ];
    return articleIds.map(one => {
      const arr = data.filter(oneRow => oneRow.id === one);
      arr[0].relations = arr.map(one => ({
        title: one.relationTitle,
        url: one.url,
        mobileUrl: one.mobileUrl,
        source: one.source,
      }));
      return arr[0];
    });
  }

  async getNewsFromDb(length, lastId) {
    let result = [];
    let resultHandled;
    if (lastId) {
      const sql =
      `select a.*,b.title as relationTitle,b.url,b.mobileUrl,b.source,date_format(a.createDate, '%Y-%c-%d %T')realDate from
       (select * from article  where id < ? order by id desc limit ?) a 
       join
       relation b
       on a.oldId=b.articleId
       order by a.id desc
      `;
      result = await this.app.mysql.query(sql, [ lastId, length ]);
    } else { // 没有lastId 说明是进入首页加载的，可以从缓存取
      if (this.app.newsCache && !this.app.isNewsCacheExpired) {
        this.logger();
        console.log('cache');
        return this.app.newsCache;
      }
      console.log('chaxu');
      const sql =
        `select a.*,b.title as relationTitle,b.url,b.mobileUrl,b.source,date_format(a.createDate, '%Y-%c-%d %T')realDate from
        (select * from article order by id desc limit ?) a 
        left join
        relation b
        on a.oldId=b.articleId
        order by a.id desc
        `;
      result = await this.app.mysql.query(sql, [ length ]);
      // 从数据库中拿到信息，cache最新，设置为不过期
      resultHandled = this.formatNews(result);
      this.app.newsCache = resultHandled;
      this.app.isNewsCacheExpired = false;

    }
    return resultHandled || this.formatNews(result);
  }
}

module.exports = NewsService;
