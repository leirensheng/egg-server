'use strict';

const Controller = require('egg').Controller;

class NewsController extends Controller {
  async get() {
    const res = await this.ctx.curl('https://api.readhub.cn/topic?lastCursor=&pageSize=4');
    const resData = JSON.parse(res.data.toString());
    const arrayData = resData.data.map((one, index) => {
      console.log(index);
      return {
        title: one.title,
        stars: Math.ceil(Math.random() * 100 + 1),
        text: one.summary,
        relations: one.newsArray.map(oneRelation => {
          return {
            text: oneRelation.title,
            url: oneRelation.url,
            mobileUrl: oneRelation.mobileUrl,
            source: oneRelation.siteName,
          };
        }),
        date: one.updatedAt.split('T')[0],
      };
    });

    const dateCategories = [ ...new Set(arrayData.map(one => one.date).sort((a, b) => a - b)) ];

    const dataHandled = dateCategories.map(oneDate => {
      return {
        type: 'article',
        date: oneDate,
        weekDay: this.ctx.helper.getWeekDay(new Date(oneDate)),
        data: arrayData.filter(one => one.date === oneDate),
      };
    });
    this.ctx.body = dataHandled;
  }
}

module.exports = NewsController;

