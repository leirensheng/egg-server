'use strict';
const crypto = require('crypto');
const moment = require('moment');

module.exports = {

  md5(str, sec) {
    return crypto.createHmac('md5', sec).update(str).digest('hex');
  },
  sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
  },
  getWeekDay(date) {
    const num = date.getDay();
    switch (num) {
      case 0:
        return '星期日';
      case 1:
        return '星期一';
      case 2:
        return '星期二';
      case 3:
        return '星期三';
      case 4:
        return '星期四';
      case 5:
        return '星期五';
      case 6:
        return '星期六';
      default:
        return '';
    }
  },
  isEnglish(text) {
    return /^[a-zA-Z]+$/.test(text);
  },
  sortByASCII(arr) {
    return Array.prototype.sort.call(arr, function (a, b) {
      for (let i = 0; i < a.length; i++) {
        if (a.charCodeAt(i) == b.charCodeAt(i)) continue;
        return a.charCodeAt(i) - b.charCodeAt(i);
      }
    });
  },

  getPublicData(realData) {
    let {
      sign,
      timestamp
    } = this.getSign(this.config.publicDataWithoutTime, realData)
    return {
      sign,
      ...this.config.publicDataWithoutTime,
      timestamp
    }
  },

  getSign(publicData, realData) {
    const timestamp = moment().format('YYYY-MM-DD hh:mm:ss')
    const dataToSign = Object.assign({
      timestamp,
    }, publicData, realData);
    const keySorted = Object.keys(dataToSign).sort();
    const str = keySorted.reduce((prev, cur) => {
      return prev + cur + dataToSign[cur];
    }, '');
    return {
      timestamp,
      sign: this.md5(str, this.config.appSecret).toUpperCase()
    }
  },

  curl2(realData) {
    const publicData = this.ctx.helper.getPublicData(realData);
    return this.app.curl(this.config.taobaoServerApi, {
      data: Object.assign(publicData, realData),
      method: 'GET',
      dataType: 'json',
    })
  },

  getIp(ctx) {
    let ipAddress;
    const forwardedIpsStr = ctx.headers['x-forwarded-for'];
    if (forwardedIpsStr) {
      const forwardedIps = forwardedIpsStr.split(',');
      ipAddress = forwardedIps[0];
    }

    if (!ipAddress) {
      ipAddress = ctx.req.connection.remoteAddress || '';
    }
    return ipAddress;
  },

  parseUa(ua) {
    const illegalDevicetype = ['Nexus 5X Build/MMB29P'];
    const specialDevicetype = {
      'HUAWEI TIT-AL00 Build/HUAWEI TIT-AL00': 'HUAWEI TIT-AL00 Build/HUAWEITIT-AL00',
      'HUAWEI TAG-TL00 Build/TAG-TL00': 'HUAWEI TAG-TL00 Build/HUAWEITAG-TL00',
      'HUAWEI TAG-AL00 Build/TAG-AL00': 'HUAWEI TAG-AL00 Build/HUAWEITAG-AL00',
      'HUAWEI NCE-AL10 Build/HUAWEINCE-AL10': 'NCE-AL10 Build/HUAWEINCE-AL10',
      'HUAWEI CUN-TL00 Build/CUN-TL00': 'CUN-TL00 Build/HUAWEICUN-TL00',
      'HUAWEI DAV-703L Build/HUAWEIDAV-703L': 'HUAWEI P8max Build/HUAWEIDAV-703L',
      'HW-HUAWEI TIT-CL00 Build/HUAWEITIT-CL00': 'HUAWEI TIT-CL00 Build/HUAWEITIT-CL00',
      'HUAWEI GEM-703L Build/HUAWEIGEM-703L': 'GEM-703L Build/HUAWEIGEM-703L',
      'HUAWEI EVA-AL10 Build/HUAWEIEVA-AL10': 'EVA-AL10 Build/HUAWEIEVA-AL10',
      'HUAWEI EVA-AL00 Build/HUAWEIEVA-AL00': 'EVA-AL00 Build/HUAWEIEVA-AL00',
      'HUAWEI VIE-AL10 Build/HUAWEIVIE-AL10': 'VIE-AL10 Build/HUAWEIVIE-AL10',
      'HUAWEI NEM-TL00 Build/HUAWEINEM-TL00': 'NEM-TL00 Build/HONORNEM-TL00',
      'HUAWEI NXT-UL00 Build/HUAWEINXT-UL00': 'HUAWEI NXT-DL00 Build/HUAWEINXT-DL00',
      'Build/NCE-AL00': 'NCE-AL00 Build/HUAWEINCE-AL00',
      'OB-OPPO A31c Build/KTU84P': 'A31c Build/KTU84P',
      'OB-OPPO R7c Build/KTU84P': 'R7c Build/KTU84P',
      'OB-OPPO 1105 Build/KTU84P': '1105 Build/KTU84P',
      'OB-OPPO R8205 Build/KTU84P': 'R8205 Build/KTU84P',
      'OB-OPPO R7005 Build/KVT49L': 'R7005 Build/KVT49L',
      'OB-OPPO 3005 Build/KTU84P': '3005 Build/KTU84P',
      'OB-OPPO A51kc Build/LMY47V': 'A51kc Build/LMY47V',
      'OPPO PACM00 Build/O11019': 'PACM00 Build/O11019',
      'OPPO A33m Build/IMM76D': 'OPPO A33m Build/LMY47V',
      'OPPO A33 Build/IMM76D': 'OPPO A33 Build/LMY47V',
      'Build/HUAWEINTS-AL00': 'NTS-AL00 Build/HUAWEINTS-AL00',
      'YL-Coolpad Y75 Build/KVT49L': 'Coolpad Y75 Build/KTU84P',
      'YL-Coolpad 5360 Build/KTU84P': 'Coolpad 5360 Build/KTU84P',
      'YL-Coolpad 8713 Build/KVT49L': 'Coolpad 8713 Build/KTU84P',
      'YL-Coolpad 8675-A Build/KVT49L': 'Coolpad 8675-A Build/KTU84P',
      'Coolpad Y90 Build/KVT49L': 'Coolpad Y90 Build/KTU84P',
      'V1801A0 Build/OPM1.171019.011': 'vivo Z1 Build/OPM1.171019.011',
      'V1730DA Build/OPM1.171019.011': 'vivo Z1i Build/OPM1.171019.011',
      'V1730DT Build/OPM1.171019.011': 'vivo Z1i Build/OPM1.171019.011',
      'MZ-Meizu S6 Build/MRA58K': 'Meizu S6 Build/NRD90M',
      'MZ-MEIZU M6 Build/MRA58K': 'MEIZU M6 Build/NRD90M',
      'MZ-MEIZU E3 Build/MRA58K': 'MEIZU E3 Build/NGI77B',
      'MZ-M621C Build/MRA58K': 'M621C Build/NRD90M',
      'MZ-PRO 5 Build/MRA58K': 'PRO 5 Build/NRD90M',
      'MZ-PRO 6 Build/MRA58K': 'PRO 6 Build/NMF26O',
      'MZ-PRO 6 Plus Build/MRA58K': 'PRO 6 Plus Build/NRD90M',
      'MZ-PRO 6s Build/MRA58K': 'PRO 6s Build/NMF26O',
      'MZ-PRO 7 Plus Build/MRA58K': 'PRO 7 Plus Build/NRD90M',
      'MZ-PRO 7-H Build/MRA58K': 'PRO 7-H Build/NRD90M',
      'MZ-PRO 7-S Build/MRA58K': 'PRO 7-S Build/NRD90M',
      'MZ-M1 E Build/MRA58K': 'M1 E Build/NRD90M',
      'MZ-M5 Note Build/MRA58K': 'M5 Note Build/MRA58K',
      'MZ-M6 Note Build/MRA58K': 'M6 Note Build/N2G47H',
      'MZ-M2 E Build/MRA58K': 'M2 E Build/MMB29U',
      'MZ-M3 Max Build/MRA58K': 'M3 Max Build/NRD90M',
      'MZ-M15 Build/MRA58K': 'M15 Build/N2G47H',
      'MZ-M3s Build/MRA58K': 'M3s Build/LMY47I',
      'MZ-M3X Build/MRA58K': 'M3X Build/MMB29U',
      'MZ-MX4 Build/MRA58K': 'MX4 Build/LMY47I',
      'MZ-MX4 Pro Build/MRA58K': 'MX4 Pro Build/LMY48W',
      'MZ-MX5 Build/MRA58K': 'MX5 Build/LMY47I',
      'MZ-MX6 Build/MRA58K': 'MX6 Build/NMF26O',
      'MZ-M571C Build/MRA58K': 'M571C Build/LMY47D',
      'MZ-Meizu 6T Build/MRA58K': 'Meizu 6T Build/NRD90M',
      'MZ-m1 metal Build/MRA58K': 'm1 metal Build/LMY47I',
      'MZ-m2 Build/MRA58K': 'm2 Build/LMY47D',
      'MZ-m3 Build/MRA58K': 'm3 Build/LMY47I',
      'MZ-m1 note Build/MRA58K': 'm1 note Build/LMY47D',
      'MZ-m2 note Build/MRA58K': 'm2 note Build/LMY47D',
      'MZ-m3 note Build/MRA58K': 'm3 note Build/NRD90M',
      'SAMSUNG-SM-N9008V_TD Release/11.15.2013 Browser/AppleWebKit537.36 Build/JSS15J': 'SM-N9008V Build/JSS15J',
      'SAMSUNG-SM-N7508V_TD Release/03.30.2014 Browser/AppleWebKit537.36 Build/JLS36C': 'SM-N7508V Build/JLS36C',
      'SAMSUNG-SM-G7108V_TD Release/02.15.2014 Browser/AppleWebKit537.36 Build/JSS15J': 'SM-G7108V Build/JLS36C',
      'SAMSUNG-GT-I9158V_TD Release/05.30.2014 Browser/AppleWebKit537.36 Build/JLS36C': 'GT-I9158V Build/JLS36C',
      'SAMSUNG-SM-G7108_TD Release/08.30.2013 Browser/AppleWebKit537.36 Build/JSS15J': 'SM-G7108 Build/JLS36C',
      'SAMSUNG-SM-G5308W_TD/1.0 Android/4.4.4 Release/08.15.2014 Browser/AppleWebKit534.30 Build/KVT49L': 'SM-G5308W Build/KTU84P',
      'SAMSUNG-SM-G5108_TD/1.0 Android/4.4.4 Release/08.05.2014 Browser/AppleWebKit534.30 Build/KTU84P': 'SM-G5108 Build/KTU84P',
      'PRO 7-S Build/MRA58K': 'PRO 7-S Build/NRD90M',
      'PRO 7-H Build/MRA58K': 'PRO 7-H Build/NRD90M',
      'PRO 7 Plus Build/MRA58K': 'PRO 7 Plus Build/NRD90M',
      'PRO 6 Plus Build/MRA58K': 'PRO 6 Plus Build/NRD90M',
      'PRO 5 Build/MRA58K': 'PRO 5 Build/NRD90M',
      'MX5 Build/MRA58K': 'MX5 Build/LMY47I',
      'MX4 Pro Build/MRA58K': 'MX4 Pro Build/LMY48W',
      'MX4 Build/MRA58K': 'MX4 Build/LMY47I',
      'Meizu S6 Build/MRA58K': 'Meizu S6 Build/NRD90M',
      'MEIZU M6 Build/MRA58K': 'MEIZU M6 Build/NRD90M',
      'MEIZU E3 Build/MRA58K': 'MEIZU E3 Build/NGI77B',
      'M6 Note Build/MRA58K': 'M6 Note Build/N2G47H',
      'M571C Build/MRA58K': 'M571C Build/LMY47D',
      'M3X Build/MRA58K': 'M3X Build/MMB29U',
      'M3s Build/MRA58K': 'M3s Build/LMY47I',
      'm3 note Build/MRA58K': 'm3 note Build/NRD90M',
      'm2 note Build/MRA58K': 'm2 note Build/LMY47D',
      'm1 note Build/MRA58K': 'm1 note Build/LMY47D',
      'm3 Build/MRA58K': 'm3 Build/LMY47I',
      'M2 E Build/MRA58K': 'M2 E Build/MMB29U',
      'm2 Build/MRA58K': 'm2 Build/LMY47D',
      'M15 Build/MRA58K': 'M15 Build/N2G47H',
      'GN5007L Build/NMF26F': 'GIONEE GN5007L Build/NMF26F',
      'GN5007 Build/NMF26F': 'GIONEE GN5007 Build/NMF26F',
      'GN5001S Build/IMM76D': 'GN5001S Build/LMY47D',
      'GIONEE-GN8002S/GIONEE-GN8002S Build/IMM76D': 'GN8002S Build/MRA58K',
      'GiONEE-GN9005/GN9005 Build/IMM76D': 'GN9005 Build/JLS36C',
      'GiONEE-GN9000L/GN9000L Build/IMM76D': 'GN9000L Build/JLS36C',
      'GIONEE-GN8003/Phone Build/IMM76D': 'GN8003 Build/MRA58K',
      'GIONEE-GN8003/GIONEE-GN8003 Build/IMM76D': 'GN8003 Build/MRA58K',
      'GiONEE-GN8001/GN8001 Build/IMM76D': 'GN8001 Build/LMY47D',
      'GIONEE-GN5005/Phone Build/IMM76D': 'GN5005 Build/MRA58K',
      'GIONEE-GN5003/GIONEE-GN5003 Build/IMM76D': 'GN5003 Build/MRA58K',
      'GiONEE-GN5001S/GN5001S Build/IMM76D': 'GN5001S Build/LMY47D',
      'GIONEE-GN3001/GN3001 Build/IMM76D': 'GN3001 Build/LMY47I',
      'GIONEE-F100L/F100L Build/IMM76D': 'F100L Build/MRA58K',
      'GIONEE-GIONEE_S10L/S10L Build/IMM76D': 'GIONEE S10L Build/NRD90M',
      'F100S Build/IMM76D': 'F100S Build/MRA58K',
      'F100L Build/IMM76D': 'F100L Build/MRA58K',
      'F100 Build/IMM76D': 'F100 Build/LMY47D',
      '16th Plus Build/MRA58K': '16th Plus Build/OPM1.171019.026',
      '16th Build/MRA58K': '16th Build/OPM1.171019.026',
      '16 X Build/MRA58K': '16 X Build/OPM1.171019.026',
      '15 Plus Build/MRA58K': '15 Plus Build/NRD90M',
      '15 Build/MRA58K': '15 Build/NGI77B',
      'M721C Build/MRA58K': 'M721C Build/N2G47H',
      'M711C Build/MRA58K': 'M711C Build/NRD90M',
      'M57AC Build/MRA58K': 'M57AC Build/LMY47D',
      'M578C Build/MRA58K': 'M578C Build/LMY47D',
      'HHT6C Build/JDQ39': 'HHT6C Build/LMY47D',
      'H1 Build/NRD90M': 'Realname authentication H1 Build/NRD90M',
      'vivo Y85 Build/LMY47V': 'vivo Y85 Build/OPM1.171019.011',
    };

    const specialUa = {
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; Lenovo S968T/V1.5) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36': 'Lenovo S898t+ Build/KOT49H',
      'Mozilla/5.0 (Linux; U; Android 5.1;zh-cn; XT1077/LPB23.13-79) AppleWebKit/537.36 (KHTML, like Gecko) Version/5.1 Mobile Safari/537.36': 'XT1077 Build/LPB23.13-79',
      'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; HW-C8817D/C8817DV100R001C92B269; 1280*720; CTC/2.0) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30': 'C8817D Build/HuaweiC8817D',
      'Mozilla/5.0 (Linux; U; Android 5.1.1;zh-cn; XT1570/LPHS23.145-22-4) AppleWebKit/537.36 (KHTML, like Gecko) Version/5.1.1 Mobile Safari/537.36': 'XT1570 Build/LPHS23.145-22-4',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5A MIUI/V9.6.2.0.NCKCNFD) NewsArticle/6.8.9': 'Redmi 5A Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5A MIUI/V9.6.2.0.NCKCNFD) VideoArticle/6.7.3': 'Redmi 5A Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 6.0.1; Redmi 4A MIUI/V9.6.1.0.MCCCNFD) VideoArticle/6.7.3': 'Redmi 4A Build/MMB29M',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; MI 5X MIUI/V9.6.2.0.NDBCNFD) VideoArticle/6.7.3': 'MI 5X Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.0; Redmi Note 4X MIUI/V9.6.2.0.NCFCNFD) VideoArticle/7.0.2': 'Redmi Note 4X Build/NRD90M',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5A MIUI/V9.6.2.0.NCKCNFD) VideoArticle/7.0.2': 'Redmi 5A Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5A MIUI/V9.6.2.0.NCKCNFD) VideoArticle/7.0.0': 'Redmi 5A Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5 MIUI/V9.6.1.0.NDACNFD) VideoArticle/7.0.2': 'Redmi 5 Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 4X MIUI/V9.6.1.0.NAMCNFD) VideoArticle/7.0.2': 'Redmi 4X Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 4X MIUI/V9.6.1.0.NAMCNFD) VideoArticle/7.0.0': 'Redmi 4X Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 6.0.1; Redmi 4A MIUI/V9.6.1.0.MCCCNFD) VideoArticle/7.0.0': 'Redmi 4A Build/MMB29M',
      'Dalvik/2.1.0 (Linux; U; Android 6.0.1; Redmi 4A MIUI/V9.6.1.0.MCCCNFD) VideoArticle/7.0.2': 'Redmi 4A Build/MMB29M',
      'UCWEB/2.0 (Linux; U; Android 8.0.0; zh-CN; MHA-AL00) U2/1.0.0 UCBrowser/10.8.7.620 U2/1.0.0 Mobile': 'MHA-AL00 Build/HUAWEIMHA-AL00',
      'Mozilla/5.0 (Linux; U; Android 5.1;zh-cn; XT1085/LPES23.32-70-5) AppleWebKit/537.36 (KHTML, like Gecko) Version/5.1 Mobile Safari/537.36': 'XT1085 Build/LPES23.32-70-5',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 4X MIUI/V9.6.1.0.NAMCNFD) NewsArticle/6.8.9': 'Redmi 4X Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 4X MIUI/V9.6.1.0.NAMCNFD) VideoArticle/6.7.3': 'Redmi 4X Build/N2G47H',
      'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; VIV-vivo X5V/PD1401V_A_1.23.1; 720*1280; CTC/2.0) AppleWebKit/537.36 (KHTML,like Gecko) Version/4.0 Mobile Safari/537.36 Chrome/38.0.2125.0 VivoBrowser/5.5.4.2': 'vivo X5V Build/KTU84P',
      'Dalvik/2.1.0 (Linux; U; Android 6.0.1; Redmi 4A MIUI/V9.6.1.0.MCCCNFD) NewsArticle/6.8.9': 'Redmi 4A Build/MMB29M',
      'HUAWEI_H60_L03/5.0 Android/4.4.2 (Linux; U; Android 4.4.2; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'H60-L03 Build/HDH60-L03',
      'Lenovo-K32c36/V2.9 Linux/3.10.49 Android/5.1.1 Release/09.20.2015 Browser/AppleWebKit537.36 Chrome/30.0.0.0 Mobile Safari/537.36 Mozilla/5.0(Linux;Android 5.1.1;) LeBrowser/5.5.271': 'Lenovo K32c36 Build/LMY47V',
      'Lenovo-K32c36/V2.9 Linux/3.10.49 Android/5.1.1 Release/09.20.2015 Browser/AppleWebKit537.36 Chrome/30.0.0.0 Mobile Safari/537.36 Mozilla/5.0(Linux;Android 5.1.1;) LeBrowser/5.5.315': 'Lenovo K32c36 Build/LMY47V',
      'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; Lenovo K80M/S100) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.4.4 Mobile Safari/534.30': 'Lenovo K80M Build/S100',
      'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; LNV-Lenovo A3500/A3500_S100_141119; 480*854; CTC/2.0) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.4.4 Mobile Safari/534.30': 'Lenovo A3500 Build/KTU84P',
      'Mozilla/5.0 (Linux;Android 5.1.1;zh-cn;LNV-Lenovo A3910e70/S100;480*854;CTC/2.0) AppleWebKit/537.36 (KHTML,like Gecko) Version/4.0 Chrome/39.0.0.0 Mobile Safari/537.36 LeBrowser/5.5.295': 'Lenovo A3910e70 Build/LMY47V',
      'Mozilla/5.0 (Linux; U; Android 4.3; zh-cn; HW-HUAWEI B199/B199V100R001C92B197; 1280*720; CTC/2.0) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30': 'HUAWEI B199 Build/HuaweiB199',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; HW-HUAWEI C199/C199V100R001C333B362; 1280*720; CTC/2.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36': 'HUAWEI C199 Build/HuaweiC199',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; Lenovo 2 A7-30TC/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.4.2 Mobile Safari/534.30': 'Lenovo 2 A7-30TC Build/KOT49H',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; Lenovo S850T/V1.5) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36': 'Lenovo S850t Build/KOT49H',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; Lenovo P780/V1.5) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36': 'Lenovo P780 Build/KOT49H',
      'Mozilla/5.0 (Linux; U; Android 4.3; zh-cn; Lenovo A330e/JLS36C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.3 Mobile Safari/534.30': 'Lenovo A330e Build/JLS36C',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; Lenovo X2-TO/V2.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36': 'Lenovo X2-TO Build/KOT49H',
      'Mozilla/5.0 (Linux; U; Android 4.4.3;zh-cn; Lenovo A3900/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.4.3 Mobile Safari/537.36': 'Lenovo A3900 Build/KTU84M',
      'Mozilla/5.0 (Linux; U; Android 5.0.2; zh-cn; VIV-vivo X5Pro V/PD1421V_A_1.25.0; 1080*1920; CTC/2.0) AppleWebKit/537.36 (KHTML,like Gecko) Version/4.0 Mobile Safari/537.36 Chrome/38.0.2125.0 VivoBrowser/5.5.4.2': 'vivo X5Pro V Build/LRX22G',
      'Mozilla/5.0 (Linux; U; Android 5.0.1;zh-cn; YOGA Tablet 2-1050LC/LRX22C) AppleWebKit/537.36 (KHTML, like Gecko) Version/5.0.1 Mobile Safari/537.36': 'YOGA Tablet 2-1050LC Build/LRX22C',
      'Mozilla/5.0 (Linux; U; Android 5.0.1;zh-cn; YOGA Tablet 2-1050F/LRX22C) AppleWebKit/537.36 (KHTML, like Gecko) Version/5.0.1 Mobile Safari/537.36': 'YOGA Tablet 2-1050F Build/LRX22C',
      'Mozilla/5.0 (Linux; U; Android 5.1; zh-cn; Coolpad 8712; Android/5.1; Release/04.24.2017) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30': 'Coolpad 8712 Build/LMY47D',
      'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; Coolpad 8712; Android/4.4.4; Release/06.06.2016) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30': 'Coolpad 8712 Build/KTU84P',
      'HONOR_Che2-TL00M_TD/5.0 Android/4.4.2 (Linux; U; Android 4.4.2; zh-cn) Release/09.05.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'Che2-TL00M Build/HonorChe2-TL00M',
      'HUAWEI_ALE-TL00_TD/5.0 Android/5.0 (Linux; U; Android 5.0; zh-cn) Release/04.05.2015 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'ALE-TL00 Build/HuaweiALE-TL00',
      'HUAWEI_CHM-TL00_TD/5.0 Android/4.4.2 (Linux; U; Android 4.4.2; zh-cn) Release/03.20.2015 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'CHM-TL00 Build/HonorCHM-TL00',
      'HUAWEI_EVA-TL00_TD/5.0 Android/6.0 (Linux; U; Android 6.0; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'EVA-TL00 Build/HUAWEIEVA-TL00',
      'HUAWEI_MT7-TL00_TD/6.0 Android/6.0 (Linux; U; Android 6.0; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI MT7-TL00 Build/HuaweiMT7-TL00',
      'HUAWEI_MT7-TL00_TD/5.0 Android/4.4.2 (Linux; U; Android 4.4.2; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI MT7-TL00 Build/HuaweiMT7-TL00',
      'HUAWEI_MT7-TL10_TD/6.0 Android/6.0 (Linux; U; Android 6.0; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI MT7-TL10 Build/HuaweiMT7-TL10',
      'HUAWEI_NXT-TL00_TD/6.0 Android/6.0 (Linux; U; Android 6.0; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI NXT-TL00 Build/HUAWEINXT-TL00',
      'HUAWEI_PE-TL00M_TD/5.0 Android/4.4.2 (Linux; U; Android 4.4.2; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'PE-TL00M Build/HuaweiPE-TL00M',
      'HUAWEI_Y635-TL00_TD/5.0 Android/4.4.4 (Linux; U; Android 4.4.4; zh-cn) Release/01.25.2015 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI Y635-TL00 Build/HuaweiY635-TL00',
      'HUAWEI_P7-L07_TD/5.0 Android/5.1.1 (Linux; U; Android 5.1.1; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI P7-L07 Build/HuaweiP7-L07',
      'HUAWEI_CHE-TL00_TD/5.0 Android/5.0 (Linux; U; Android 5.0; zh-cn) Release/04.20.2015 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'CHE-TL00 Build/HonorCHE-TL00',
      'HUAWEI_CHE-TL00_TD/5.0 Android/4.4.2 (Linux; U; Android 4.4.2; zh-cn) Release/03.20.2015 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'CHE-TL00 Build/HonorCHE-TL00',
      'HUAWEI_GRA-TL00_TD/5.0 Android/5.0.1 (Linux; U; Android 5.0.1; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI GRA-TL00 Build/HUAWEIGRA-TL00',
      'HUAWEI_GRA-TL00_TD/6.0 Android/6.0 (Linux; U; Android 6.0; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI GRA-TL00 Build/HUAWEIGRA-TL00',
      'UCWEB/2.0 (Linux; U; Android 8.0.0; zh-CN; VTR-AL00) U2/1.0.0 UCBrowser/10.8.7.620 U2/1.0.0 Mobile': 'VTR-AL00 Build/HUAWEIVTR-AL00',
      'Mozilla/5.0 (Linux; U; Android 6.0.1) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 XiaoMi/MiuiBrowser/2.1.1': 'MI 4LTE Build/MMB29M',
      'Mozilla/5.0 (Linux; U; Android 5.0.2) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 XiaoMi/MiuiBrowser/2.1.1': 'Redmi Note 2 Build/LRX22G',
      'Mozilla/5.0 (Linux; U; Android 4.4.4) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 XiaoMi/MiuiBrowser/2.1.1': 'HM NOTE 1S Build/KTU84P',
      'Mozilla/5.0 (Linux; U; Android 5.0.2;zh-cn; XT1079/LXB22.99-24.7) AppleWebKit/537.36 (KHTML, like Gecko) Version/5.0.2 Mobile Safari/537.36': 'XT1079 Build/LXB22.99-24.7',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; BBG-vivo X3V/PD1227V_A_1.22.2; 720*1280; CTC/2.0) AppleWebKit/537.36 (KHTML,like Gecko) Version/4.0 Mobile Safari/537.36 Chrome/38.0.2125.0 VivoBrowser/5.5.4.2': 'vivo X3V Build/KVT49L',
      'Mozilla/5.0 (Linux; U; Android 4.3; zh-cn; HW-H30-C00/H30-C00V100R001C92B189; 1280*720; CTC/2.0) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30': 'H30-C00 Build/HuaweiH30-C00',
      'Mozilla/5.0 (Linux; U; Android 5.0;zh-cn; Lenovo K50-t3s/LRX21M) AppleWebKit/537.36 (KHTML, like Gecko) Version/5.0 Mobile Safari/537.36': 'Lenovo K50-t3s Build/LRX21M',

      'HUAWEI_P7-L07_TD/5.0 Android/4.4.2 (Linux; U; Android 4.4.2; zh-cn) Release/01.18.2014 Browser/WAP2.0 (AppleWebKit/537.36) Mobile Safari/537.36': 'HUAWEI P7-L07 Build/HuaweiP7-L07',
      'Dalvik/2.1.0 (Linux; U; Android 8.1.0; Redmi 6A MIUI/V10.0.1.0.OCBCNFH) VideoArticle/6.7.2': 'Redmi 6A Build/O11019',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi Note 5A MIUI/V9.6.3.0.NDKCNFD) VideoArticle/6.7.2': 'Redmi Note 5A Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi Note 5A MIUI/V9.5.6.0.NDFCNFA) VideoArticle/6.7.2': 'Redmi Note 5A Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5A MIUI/V9.6.2.0.NCKCNFD) VideoArticle/6.7.2': 'Redmi 5A Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5 Plus MIUI/V9.6.3.0.NEGCNFD) VideoArticle/6.7.2': 'Redmi 5 Plus Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5 Plus MIUI/V9.6.3.0.NEGCNFD) VideoArticle/6.7.3': 'Redmi 5 Plus Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 5 MIUI/V9.6.1.0.NDACNFD) VideoArticle/6.7.3': 'Redmi 5 Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.1.2; Redmi 4X MIUI/V9.6.1.0.NAMCNFD) VideoArticle/6.7.2': 'Redmi 4X Build/N2G47H',
      'Dalvik/2.1.0 (Linux; U; Android 7.0; Redmi Note 4X MIUI/V9.6.2.0.NCFCNFD) VideoArticle/6.7.2': 'Redmi Note 4X Build/NRD90M',
      'Dalvik/2.1.0 (Linux; U; Android 7.0; Redmi Note 4X MIUI/V9.6.2.0.NCFCNFD) VideoArticle/6.7.3': 'Redmi Note 4X Build/NRD90M',
      'Dalvik/2.1.0 (Linux; U; Android 6.0.1; Redmi 4A MIUI/V9.6.1.0.MCCCNFD) VideoArticle/6.7.2': 'Redmi 4A Build/MMB29M',
      'Dalvik/2.1.0 (Linux; U; Android 6.0.1; Redmi 4A MIUI/V9.6.1.0.MCCCNFD) VideoArticle/6.7.0': 'Redmi 4A Build/MMB29M',
      'Dalvik/2.1.0 (Linux; U; Android 6.0.1; Redmi 3S MIUI/V9.6.2.0.MALCNFD) VideoArticle/6.7.2': 'Redmi 3S Build/MMB29M',
      'Dalvik/2.1.0 (Linux; U; Android 6.0; Redmi Note 4 MIUI/V9.6.2.0.MBFCNFD) VideoArticle/6.7.3': 'Redmi Note 4 Build/MRA58K',
      'Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; VIV-vivo Y923/PD1419V_A_2.2.0; 480*854; CTC/2.0) AppleWebKit/537.36 (KHTML,like Gecko) Version/4.0 Mobile Safari/537.36 Chrome/38.0.2125.0 VivoBrowser/5.5.4.2': 'vivo Y923 Build/KTU84P',
    };

    function trim(s) {
      return s.replace(/(^\s*)|(\s*$)/g, '');
    }


    function UA2Source(ua) {
      const keywords = {
        UCBrowser: 'uc',
        MicroMessenger: 'weixin',
        ' QQ': 'qq',
        MQQBrowser: 'qqBrowser',
        DingTalk: 'dingding',
        Weibo: 'weibo',
        baidubrowser: 'baidubrowser',
        LieBaoFast: 'liebao',
        SogouMobileBrowser: 'sogou',
        Firefox: 'firefox',
        MxBrowser: 'MxBrowser',
        baiduboxapp: 'baiduApp',
      };
      if (typeof ua === 'string') {
        for (const index in keywords) {
          if (ua.indexOf(index) !== -1) {
            return keywords[index];
          }
        }

        if (ua.indexOf('Mac') !== -1) {
          return 'Safari';
        }

        if (ua.indexOf('Android') !== -1) {
          return 'System';
        }
      }

      return 'other';


    }

    const shortDevicetypeArr = ['Build/NRD90M', 'Build/MRA58K', 'Build/LMY47D', 'Build/NMF26F', 'Build/N6F26Q', 'Build/LMY47I', 'Build/LRX21M'];
    const parserData = {
      pl: 'other',
      devicetype: 'other',
      system: 'other',
    };
    parserData.pl = 'other';
    parserData.devicetype = 'other';
    parserData.system = 'other';
    parserData.source = UA2Source(ua);
    parserData.isIllegalDevicetype = false;
    if (!ua) {
      return parserData;
    }

    const str = ua.split('(');
    let i;
    if (str.length > 1) {
      const str2 = str[1].split(')');
      if (str2.length > 1) {
        const osAndType = str2[0].split(';');
        if (osAndType.slice(1).every(one => /^\+/.test(one))) {
          osAndType.forEach((one, index, arr) => {
            if (index !== 0) {
              arr[index] = one.replace(/\+/g, ' ');
            }
          });
        }
        const num = osAndType.length;
        if (ua.indexOf('Android') !== -1) {
          parserData.pl = 'Android';
          for (i = 0; i < num; i++) {
            // 未修改前：
            // 0. 出现Android 7.0.0 Android 7.0  Android 7并存情况
            // 1.Mozilla/5.0 (Linux; Android 4.4.4; zh-cn; SAMSUNG-SM-G5308W_TD/1.0 Android/4.4.4 Release/08.15.2014 Browser/AppleWebKit534.30 Build/KVT49L) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30    system占用了devicetype，导致devicetype识别为other
            // 2.Mozilla/5.0 (Linux; U; Android 4.4.4;  zh-cn; Coolpad 8712; Android/4.4.4; Release/06.06.2016)  AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30   也会使system判断为 Android/4.4.4，虽然修改后devicetype仍然为other，但是可以通过报表尝试匹配获得对应关系
            // 3.Mozilla/5.0+(Linux;+Android+6.0.1;+SM-G9300+Build/MMB29M;+wv)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Version/4.0+Chrome/49.0.2623.105+Mobile+Safari/537.36+MxBrowser/4.5.10.1000+   =>+Android+6.0.1
            // 4.Mozilla/5.0 (Linux; U; Android 8.0zh-cn; ONEPLUS A6000 Build/PKQ1.180716.001) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 Chrome/57.0.2987.132 MQQBrowser/8.1 Mobile Safari/537.36 =>Android 8.0zh-cn
            // 5.Mozilla/5.0 (Linux; Android 4.2.3.2; 8190Q Build/JZO54K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile MQQBrowser/6.8 TBS/036887 Safari/537.36 MicroMessenger/6.3.31.940 NetType/WIFI Language/zh_CN    =>Android 4.2.3.2
            // 6.Mozilla/5.0 (Linux; U; Android 3.2.0-FL2-20180726.9015; zh-cn; DOOV V18 Build/LMY47D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 Tanggula/0.1.0 WebLight/1.4.1 oc_AppSearch/3.5.0.pb =>Android 3.2.0-FL2-20180726.9015
            // 7.Dalvik/v3.3.117 Compatible (TVM xx; YunOS 3.0; Linux; U; Android 5.1 Compatible; Bird L7 Build/KTU84P)  =>Android 5.1 Compatible
            if (/Android(\s\d|$)/.test(osAndType[i]) && osAndType[i].indexOf('Build') === -1) {
              let system = trim(osAndType[i]);
              system = system.replace(/(\s)?(en-us)|(en-gb)|(zh-hk)|(zh-cn)|(zh-tw)$/, '');
              system = system.replace(/(\d\.\d\.\d)\.\d$/, '$1');
              system = system.replace(/(\d\.\d\.\d)(\s|\-).*$/, '$1');
              system = system.replace(/(\d\.\d)(\s|\-).*$/, '$1');
              system = system.replace(/(\d)(\s|\-).*$/, '$1');
              system = system.replace(/\.0\.0$/, '');
              system = system.replace(/\.0$/, '');
              parserData.system = system;
            } else if (osAndType[i].indexOf('Build') !== -1) {
              parserData.devicetype = trim(osAndType[i]);
              if (parserData.devicetype.indexOf('MZ-') === 0) {
                parserData.devicetype = parserData.devicetype.substring(3);
              } else if (parserData.devicetype.indexOf('SAMSUNG ') === 0) {
                parserData.devicetype = parserData.devicetype.substring(8);
              } else if (ua.indexOf('GIONEE-') !== -1) {
                const shortDevicetype = shortDevicetypeArr.find(one => one === parserData.devicetype);
                if (shortDevicetype) {
                  let device = ua.split(' ').find(one => one.indexOf('GIONEE') !== -1);
                  device = device.split('-')[1].split('/')[0];
                  parserData.devicetype = device + ' ' + shortDevicetype;
                }
              }
              parserData.devicetype in specialDevicetype && (parserData.devicetype = specialDevicetype[parserData.devicetype]);
            }
          }
          if (parserData.devicetype === 'other') {
            if (ua in specialUa) {
              parserData.devicetype = specialUa[ua];
            } else if (ua.indexOf('UCWEB') === 0) {
              let device = osAndType.slice(-1)[0];
              device = trim(device);
              if (device.indexOf('HUAWEI ') === 0) {
                device = device.split('HUAWEI ')[1];
                parserData.devicetype = `HUAWEI ${device} Build/HUAWEI${device}`;
              } else {
                parserData.devicetype = `${device} Build/HUAWEI${device}`;
              }
              // 例子：ua 为 'UCWEB/2.0 (Linux; U; Android 8.0.0; zh-CN; WAS-AL00) U2/1.0.0 UCBrowser/10.8.7.620 U2/1.0.0 Mobile', 修改为devicetype修改为'WAS-AL00 Build/HUAWEIWAS-AL00'
              // ua 为 'UCWEB/2.0 (Linux; U; Android 7.0; zh-CN; HUAWEI NXT-AL10) U2/1.0.0 UCBrowser/10.8.7.620 U2/1.0.0 Mobile', 修改为 'HUAWEI NXT-AL10 Build/HUAWEINXT-AL10'
            } else if (osAndType.slice(-1)[0].indexOf('LNV-') !== -1) {
              let temp = osAndType.slice(-1)[0].split('LNV-')[1];
              if (temp.indexOf('/') !== -1) {
                temp = temp.split('/');
                parserData.devicetype = temp[0] + ' Build/' + temp[1];
              }
            }
          }
        } else if (ua.indexOf('Mac') !== -1) {
          parserData.pl = 'ios';
          for (i = 0; i < num; i++) {
            if (osAndType[i].indexOf('like') !== -1) {
              parserData.system = trim(osAndType[i]);
            } else if ((osAndType[i].indexOf('iPad') !== -1) || (osAndType[i].indexOf('iPhone') !== -1)) {
              parserData.devicetype = trim(osAndType[i]);
              if (parserData.source === 'qqBrowser' && parserData.devicetype.indexOf('iPhone') !== -1) {
                parserData.devicetype = 'iPhone';
              }
            }
          }
        }
      }
    }
    parserData.isIllegalDevicetype = !!illegalDevicetype.includes(parserData.devicetype);
    return parserData;
  },


};
// todo: session   cookie