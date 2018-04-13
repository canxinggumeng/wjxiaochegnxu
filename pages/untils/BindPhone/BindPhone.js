const commonReuqet = require('../../../utils/commonRequest.js')
const app = getApp()
// 绑定手机号码
function bindPhoneNumber(encryptedData, iv, success) {

  decryptRequet(encryptedData, iv, function (res) {
    var url = 'api/login/bind-phone-xcx';
    var params = {
      uid: app.globalData.wjuserInfo.uid,
      phone: res,
      is_verify_code: '0'
    };
    console.log(params);
    commonReuqet.requestPost(url, params, function (res) {
      console.log(res);
      if (res.data.message) {
        wx.setStorageSync('wjuserInfo', res.data.message);
        app.globalData.wjuserInfo = res.data.message;
        app.connectRCIM(app.globalData.wjuserInfo.token);
        app.globalData.user = {
          'name': app.globalData.userInfo.nickName,
          'userId': res.data.message.uid,
          'avatar': app.globalData.userInfo.avatarUrl
        };
        success();
      } else {
        console.log(res);
      }
    })
  })
}
function decryptRequet(encryptedData, iv, success) {

  var wjuserInfo = wx.getStorageSync('wjuserInfo');
  console.log(wjuserInfo)
  var that = this;
  var url = 'api/weixin/decode-data';
  var params = {
    encryptedData: encryptedData,
    iv: iv,
    type: 'phone',
    session_key: wjuserInfo.session_key
  }
  commonReuqet.requestPost(url, params, function (res) {
    console.log(res);
    // 存储用户电话号码
    try {
      if (res.data.message.phone) {
        wx.setStorageSync('userPhoneNumber', res.data.message.phone);
        success(res.data.message.phone);
      } else {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }

  });
}
module.exports = {
  bindPhoneNumber: bindPhoneNumber
}