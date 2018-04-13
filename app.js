//app.js
var utils = require('/utils/util.js');
var RongIMLib = require("/pages/RongIMLib.xiaochengxu-1.0.0.js");
var utilApi = require("/utils/commonRequest.js");
var RongIMClient = RongIMLib.RongIMClient;
var RCIMTools = require('/pages/untils/RCIMTools/RCIMTools.js');
var Base64 = require('/utils/base64Encode.js');
var code = '';
var encryptedData = '';
var dataIv = '';
var finish = 0;
// var connectNum = 0;
function getUserNum(nickName) {
  var num = utils.unicode(nickName).slice(-1);
  while (isNaN(num)) {
    num = utils.unicode(num).slice(-1);
  }
  return num;
}
App({
  onLaunch: function (options) {
    var that = this;
    // 从缓存中取值
    // 1.能取到,检测登录是否过期 
    // 1.1 过期,重新登录
    // 1.2 未过期,直接登录
    // 2.不能取到
    // 2.1 直接登录
    var wjuserInfo = wx.getStorageSync('wjuserInfo');
    if (wjuserInfo) {
      wx.checkSession({
        success: function () {
          wx.getUserInfo({
            lang: 'zh_CN',
            success: res => {

              that.globalData.userInfo = res.userInfo;
              that.globalData.user = {
                'name': res.userInfo.nickName,
                'userId': wjuserInfo.uid,
                'avatar': res.userInfo.avatarUrl
              };

              that.globalData.wjuserInfo = wjuserInfo;
              that.connectRCIM(wjuserInfo.token);
              if (that.userInfoReadyCallback) {
                that.userInfoReadyCallback(res)
              }
              if (that.userLoginInfoCallBack) {
                that.userLoginInfoCallBack(wjuserInfo);
              }
            }
          })
        },
        fail: function () {
          that.loginGetUserInfo();
        }
      })
    } else {
      that.loginGetUserInfo();
    };
  
    wx.getUpdateManager().onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log('是否有新的版本: ', res.hasUpdate)
    });

    wx.getUpdateManager().onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })

    });

    wx.getUpdateManager().onUpdateFailed(function () {
      // 新的版本下载失败
    });

  },
  // 登录并且获取用户信息
  loginGetUserInfo: function () {
    var that = this;
    wx.login({
      success: res => {
        code = res.code;
        wx.getUserInfo({
          lang: 'zh_CN',
          success: res => {
            that.getUserInfoSuccess(res);
          },
          fail: function () {
            console.log('重新获取授权')
            that.requireAuth();
          }
        });
      },
      fail: function () {
        console.log('登录失败')
      }
    });
  },
  // 重新获取授权
  requireAuth: function () {
    var that = this;
    wx.openSetting({
      success: (res) => {
        wx.getUserInfo({
          lang: 'zh_CN',
          success: res => {
            that.getUserInfoSuccess(res);
          }
        })
      }
    })
  },
  // 获取用户信息成功 
  getUserInfoSuccess: function (res) {
    var that = this;
    that.globalData.userInfo = res.userInfo;
    encryptedData = res.encryptedData;
    dataIv = res.iv;
    that.wujiesqLogin(code, encryptedData, dataIv);
    if (that.userInfoReadyCallback) {
      that.userInfoReadyCallback(res)
    }
  },
  onShow: function (options) {
    var that = this;
    that.globalData.screne = options.scene;
    console.log('页面显示');
    console.log(options.scene);

    if (that.globalData.isBackGround) {
      that.globalData.isBackGround = false;
      console.log('到前台重新开始连接');
      that.connectRCIM(that.globalData.wjuserInfo.token);
      // RCIMTools.reconnect();

    }


  },
  onHide: function () {
    console.log('进入后台');
    this.globalData.isBackGround = true;
    // if (RongIMClient.getCurrentConnectionStatus == RongIMLib.ConnectionStatus.CONNECTED) {
    console.log('断开连接');
    RCIMTools.disconnect();
    // }

  },
  globalData: {
    connect: false,
    userInfo: null, //微信登陆的用户信息
    user: null, //当前用户rongcloud信息
    wjuserInfo: null, // 无界商圈请求用户信息
    agentList: [], //联系人数组
    screne: '', // 打开场景值
    connectNum: 0,
    isBackGround: false // 是否在后台
  },
  addListener: function (callback) {
    this.callback = callback;
  },
  setChangedData: function (data) {
    if (this.callback != null) {
      this.callback(data);
    }
  },

  wujiesqLogin: function (code, data, iv) {
    var that = this;
    var url = 'api/login/register-login-xcx';
    // 发送 res.code 到后台换取 openId, sessionKey, unionId
    var base = new Base64();
    var baseData = base.encode(data);
    console.log('原始数据：')
    console.log(data)
    utilApi.requestPost(url, {
      'code': code,
      'encryptedData': baseData,
      'iv': iv
    }, function (datas) {

      console.log('登录接口请求结果:');
      console.log(datas);
      if (datas.data.status == true) {
        var res = datas.data.message;
        console.log(res);
        if (res.is_bind_phone == 0) { // 不需要绑定,直接连接融云,存储用户信息
          wx.setStorageSync('wjuserInfo', res);
          that.globalData.wjuserInfo = res;
          that.connectRCIM(res.token);
          if (that.userLoginInfoCallBack) {
            that.userLoginInfoCallBack(res);
          };
          that.globalData.user = {
            'name': that.globalData.userInfo.nickName,
            'userId': res.uid,
            'avatar': that.globalData.userInfo.avatarUrl
          };
        } else { // 需要绑定,等待绑定结束后再连接融云并且更新用户信息
          wx.setStorageSync('wjuserInfo', res);
          that.globalData.wjuserInfo = res;
          if (that.userLoginInfoCallBack) {
            that.userLoginInfoCallBack(res);
          };
        }
      } else {
        console.log('接口请求失败')
        utilApi.tips('服务器开小差了~_~,请稍后重试', 2500);
      }
    })
  },
  connectRCIM: function (token) {
    // 初始化融云连接  
    var that = this;
    var wjuserInfo = wx.getStorageSync('wjuserInfo');
    RCIMTools.rcimConnect(that, token);
    RCIMTools.getAgentList(wjuserInfo.uid, function (res) {
      that.globalData.agentList = res;
    });
    that.globalData.connectNum++;
  }

})