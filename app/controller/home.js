'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const obj = {};
    Array.from({ length: 1000 }, (one, index) => index).forEach((one, index) => {
      obj[index] = one;
    });
    this.ctx.body = obj;
  }
}

module.exports = HomeController;
