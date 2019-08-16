'use strict';
const path = require('path');
const fs = require('fs');

const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');

const Controller = require('egg').Controller;

class MailController extends Controller {
  async send() {
    const result = await this.ctx.service.mail.send(this.ctx.query.to, this.ctx.query.content);
    this.ctx.body = result;
  }
  async upload() {
    const ctx = this.ctx;
    const stream = await ctx.getFileStream();
    console.log('stream============================', stream);

    // 文件名:随机数+时间戳+原文件后缀
    // path.extname(stream.filename).toLocaleLowerCase()为后缀名（.jpg,.png等）
    const filename = Math.random().toString(36).substr(2) + new Date().getTime() + path.extname(stream.filename).toLocaleLowerCase();
    // 图片存放在静态资源public/img文件夹下
    const target = path.join(__dirname, '../public/', filename);
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
    this.ctx.body = {
      code: 0,
      data: filename,
      msg: '',
      success: true,
    };
  }
}

module.exports = MailController;
