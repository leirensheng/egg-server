'use strict';
module.exports = {
  getWeekDay(date) {
    const num = date.getDay();
    switch (num) {
      case 0 : return '星期日';
      case 1 : return '星期一';
      case 2 : return '星期二';
      case 3 : return '星期三';
      case 4 : return '星期四';
      case 5 : return '星期五';
      case 6 : return '星期六';
      default: return '';
    }
  },
  isEnglish(text) {
    return /^[a-zA-Z]+$/.test(text);
  },
};

// todo: session   cookie
