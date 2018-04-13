
const config = require("config.js");

//post网络请求
function requestPost(url, parameters, success, fail) {
  wx.request({
    url: config.TYHostURL + url + config.TYVersion,
    data: parameters,
    method: "POST", // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/json'
    }, // 设置请求的 header
    success: function (res) {

      success(res);
  },
    fail: function (res) {
      // fail
      fail();
    },
    complete: function () {
      // complete
    }
  })
}

//get网络请求
function requestGet(url, parameters, success, fail) {
  wx.request({
    url: config.TYHostURL + url + "?" + parameters,
    data: {},
    method: "GET", // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/json'
    }, // 设置请求的 header
    success: function (res) {

    success(res);

    },
    fail: function () {
      // fail
      fail();
    },
    complete: function () {
      // complete
    }
  })
}


//HUD 
//成功提示
function showSuccess(title = "成功啦", duration = 2500) {
  wx.showToast({
    title: title,
    icon: 'success',
    duration: (duration <= 0) ? 2500 : duration
  });
}
//loading提示
function showLoading(title = "请稍后", duration = 5000) {
  wx.showToast({
    title: title,
    icon: 'loading',
    duration: (duration <= 0) ? 5000 : duration
  });
}
//文字提示
function tips(string,duration){
  wx.showToast({
    title: string,
    icon: 'none', 
    duration: duration || 2500
  })
}
//隐藏提示框
function hideToast() {
  wx.hideToast();
}

//显示带取消按钮的消息提示框
function alertViewWithCancel(title = "提示", content = "消息提示", confirm, showCancel = "true") {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    success: function (res) {
      if (res.confirm) {
        confirm();
      }
    }
  });
}
//显示不取消按钮的消息提示框
function alertView(title = "提示", content = "消息提示", confirm) {
  alertViewWithCancel(title, content, confirm, false);
}

module.exports = {
  requestPost: requestPost,
  requestGet: requestGet,
  showSuccess: showSuccess,
  showLoading: showLoading,
  hideToast: hideToast,
  alertViewWithCancel: alertViewWithCancel,
  alertView: alertView,
  tips:tips
}