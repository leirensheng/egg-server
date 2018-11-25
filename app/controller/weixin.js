'use strict';

const Controller = require('egg').Controller;
// xml解析模块
const XMLJS = require('xml2js');
// 解析，将xml解析为json
const parser = new XMLJS.Parser();
// 重组，将json重组为xml
const builder = new XMLJS.Builder();

class WeixinController extends Controller {
  async weixinCheck() {
    const result = this.service.weixin.check(this.ctx.request.query.signature, this.ctx.request.query.timestamp, this.ctx.request.query.nonce, this.ctx.request.query.echostr);
    this.ctx.body = result;
  }
  dataFromWx() {
    // const result = this.service.weixin.check(this.ctx.request.query.signature, this.ctx.request.query.timestamp, this.ctx.request.query.nonce, this.ctx.request.query.echostr);
    // if (result) {
    let reqData = '';
    this.ctx.req.on('data', function(data) {
      reqData = reqData + data;
    });
    this.ctx.req.on('end', function() {
      parser.parseString(reqData.toString(), function(err, result) {
        const body = result.xml;
        console.log(body);
        const messageType = body.MsgType;
        // 用户点击菜单响应事件
        if (messageType === 'event') {
          var eventName = body.Event(EventFunction[eventName] || function() {})(body, req, res);
          // 自动回复消息
        } else if (messageType === 'text') {
          EventFunction.responseNews(body, res);
          // 第一次填写URL时确认接口是否有效
        } else {
          res.send(echostr);
        }
      });
    });

    console.log('data From Wx', this.ctx.request.body);
    this.ctx.body = '';
    // }
  }
  async test() {
    this.ctx.body = await this.service.weixin.getTocken();
  }
}

module.exports = WeixinController;

