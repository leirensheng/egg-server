'use strict';

const Controller = require('egg').Controller;

class MailController extends Controller {
  async send() {
    const result = await this.ctx.service.mail.send(this.ctx.query.to, this.ctx.query.content);
    this.ctx.body = result;
  }
}

module.exports = MailController;
