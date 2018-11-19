'use strict';

const Controller = require('egg').Controller;

class TaobaoController extends Controller {
  async get() {
    await this.service.taobao.getItem();
  }

}

module.exports = TaobaoController;

