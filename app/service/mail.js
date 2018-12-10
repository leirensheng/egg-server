'use strict';

const Service = require('egg').Service;
const nodemailer = require('nodemailer');

class MailService extends Service {
  async send(to, content) {
    const transporter = nodemailer.createTransport({
      service: '163',
      auth: {
        user: 'leirensheng', // 你的163邮箱账号
        pass: '1221lrs', // 你的163邮箱密码
      },
    });
    const mailOptions = {
      from: 'leirensheng@163.com', // sender address
      to, // list of receivers
      subject: '券你省点钱验证码', // Subject line
      text: '券你省点钱验证码', // plaintext body
      html: `<h2>${content}</h2>`,
    };

    try {
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
      return {
        success: true,
      };
    } catch (e) {
      console.log(e);
      return {
        success: false,
      };
    }
  }
}

module.exports = MailService;
