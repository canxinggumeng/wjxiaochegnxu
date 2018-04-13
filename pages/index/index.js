//index.js
const commonReuqet = require('../../utils/commonRequest.js')
const BindPhone = require('../untils/BindPhone/BindPhone.js')
const app = getApp()
var brandID = ''
var agent_id = ''
var share_unique_id = ''
Page({
  data: {
    userInfo: {},
    showModal: false,
  },
  //事件处理函数
  gotoHome: function () {
    wx.reLaunch({
      url: '../brand/list/list'
    })
  },
  // 进入品牌详情页
  gotoBrandDetail: function () {
    var self = this;
    if (app.globalData.wjuserInfo.is_register == 1) {
      self.bindAgent();
    }
    var url = '../brand/detail/detail?id=' + brandID + '&uid=' + app.globalData.wjuserInfo.uid + '&agent_id=' + agent_id + '&is_new=1';
    console.log(url);
    wx.redirectTo({
      url: '../brand/detail/detail?id=' + brandID + '&uid=' + app.globalData.wjuserInfo.uid + '&agent_id=' + agent_id + '&is_new=1'
    })
  },
  getPhoneNumber: function (e) {
    console.log('获取号码结果');
    console.log(e);
    this.hideModal()
    var that = this;
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      BindPhone.bindPhoneNumber(e.detail.encryptedData, e.detail.iv, function (res) {
        that.gotoHome();
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '无界商圈只有获取你的手机号才能提供服务',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            that.setData({
              showModal: true
            })
          }
        }
      })
    }
  },
  onLoad: function (options) {
    console.log("index页面load");
    var self = this;
    if (app.globalData.screne == 1011 || app.globalData.screne == 1012 || app.globalData.screne == 1013) {
      var param = options.scene;

      var params = param.split('&');
      agent_id = params[0];
      brandID = params[1];
      share_unique_id = params[2];
    } else {
      agent_id = options.agent_id;
      brandID = options.id;
      share_unique_id = options.share_unique_id;
    }
    if (app.globalData.wjuserInfo) {
      if (app.globalData.screne == 1036 || app.globalData.screne == 1011 || app.globalData.screne == 1012 || app.globalData.screne == 1013) {
        self.gotoBrandDetail();
      } else {
        self.gotoHome();
      }
    } else {
      app.userInfoReadyCallback = res => {
        self.setData({
          userInfo: res.userInfo,
        })
        console.log("弹出极速登录")
        self.showDialogBtn()
      }
    }
  },
  getPhoneNumber: function (e) {
    console.log('获取号码结果');
    console.log(e);
    this.hideModal()
    var that = this;
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      BindPhone.bindPhoneNumber(e.detail.encryptedData, e.detail.iv, function (res) {
        that.gotoHome();
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '无界商圈只有获取你的手机号才能提供服务',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            that.setData({
              showModal: true
            })
          }
        }
      })
    }

  },

  // 绑定经纪人
  bindAgent: function () {
    if (app.globalData.wjuserInfo.is_register && agent_id.length) {
      var url = 'api/login/bind-agent';
      var param = {
        agent_id: agent_id,
        uid: app.globalData.wjuserInfo.uid,
        share_unique_id: share_unique_id,
        source_type: 'brand', //新增
        post_id: brandID //新增
      }
      commonReuqet.requestPost(url, param, function (res) {
        console.log(res);
      })
    }
  },
  /**
   * 弹窗
   */
  showDialogBtn: function () {
    app.userLoginInfoCallBack = res => {
      console.log('弹窗回调')
      var that = this;
      if (app.globalData.screne == 1036 || app.globalData.screne == 1011 || app.globalData.screne == 1012 || app.globalData.screne == 1013) {
        that.gotoBrandDetail();
      } else {
        var wjuserInfo = wx.getStorageSync('wjuserInfo');
        var userPhoneNumber = wx.getStorageSync('userPhoneNumber')
        // if (wjuserInfo.is_bind_phone == 0) {
        //   that.gotoHome();
        // } else {
        //   that.setData({
        //     showModal: true
        //   })
        //   app.connectRCIM(wjuserInfo.token);
        // }
        that.gotoHome();
        if (wjuserInfo.is_bind_phone == 0) {
          if (app.globalData.connectNum == 0) {
            app.connectRCIM(wjuserInfo.token);
            // app.globalData.connectNum = 0;
          }
        }
      }

    }

  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {},
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

})