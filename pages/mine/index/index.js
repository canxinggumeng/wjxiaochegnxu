// pages/mine/index/index.js
var config = require("../../../utils/config.js");
const app = getApp();
var api = require('../../../utils/commonRequest.js');
var activity_id = '';
Page({

  /**
   * 页面的初始数据
   */

  //
  // 后续跳转页面写入对应URL
  //
  data: {
    userInfo: {},
    uid:'',
    showModal:false,
    list:[
      {
        icon:'../../../images/mine/yixiangpai.png',
        title:'意向品牌',
        url:"../../brand/intention/list?type=1"
      },
      {
        icon: '../../../images/mine/pinpailiulan.png',
        title: '浏览记录',
        url: '../../brand/intention/list?type=2'
      },
      {
        icon: '../../../images/mine/menpiao.png',
        title: '我的门票',
        url: '../Ticket/ticket'
      },
      // {
      //   icon: '../../../images/mine/dingdan.png',
      //   title: '订单记录',
      //   url: ''
      // },
      // {
      //   icon: '../../../images/mine/jingjiren.png',
      //   title: '我的经纪人',
      //   url: ''
      // },
      {
        icon: '../../../images/mine/shoucang.png',
        title: '我的收藏',
        url: '../../brand/intention/list?type=3'
      },
      {
        icon: '../../../images/mine/hongbao.png',
        title: "红包",
        url: '../../brand/redlist/redlist'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getWxUserInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  getWxUserInfo: function (e) {
    var self = this
    
    if (app.globalData.userInfo) {
      self.setData({
        userInfo: app.globalData.userInfo
      });
    }

    if (app.globalData.wjuserInfo) {
      self.setData({
        uid: app.globalData.wjuserInfo.uid
      });
    }
  },

  qCodeScanTap:function() {
    var self = this
    wx.scanCode({
      success: (res) => {
        var path = res.result
        if (path.indexOf('activityinfo:') != -1) {
          activity_id = path.match(/\bactivity_id=\d+/)[0]
          activity_id = activity_id.substring(12)
          var maker_id = path.match(/\maker_id=\d+/)[0]
          maker_id = maker_id.substring(9)
          var params = { 'activity_id': activity_id, 'maker_id': maker_id, 'uid': self.data.uid }
          api.requestPost("api/activity/sign", params, function (res) {
            if (res.data.status) {
              self.openAlert('签到成功');
              var param = {}
              param['uid']=uid;
              param['activity_id']=activity_id;
              param['maker_id']=maker_id;
              param['sign_type']='standard';
                api.requestPost("api/activity/tempsign", param, function (res) {
                  
                });
            } else {
              var resType = res.data.message.type
              if (resType == '0') {
                self.activityInfoAlert()
              } else if (resType == '2') {
                self.openAlert('活动已结束')
              } else if (resType == '1') {
                self.openAlert('签到成功')
              } 
            }
          });
        
        }
      }
    });
  },

  openAlert: function (msg) {
    wx.showModal({
      title: '活动签到',
      content: msg,
      showCancel: false,
    });
  },

  activityInfoAlert:function() {
    var self = this
    wx.showModal({
      title: '活动签到',
      content: '未报名活动，现在去报名',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          var wjuserInfo = wx.getStorageSync('wjuserInfo');
          if (wjuserInfo.is_bind_phone == 0) {
            self.activityDetail()
          } else {
            self.setData({
              showModal: true
            })
          }
        }
      }
    });
  },

  activityDetail:function() {
    var href = config.TYHostURL + 'webapp/activity/detail' + config.TYVersion + '?id=' + activity_id + '&uid=' +  app.globalData.wjuserInfo.uid
          try {
            wx.setStorageSync('url', href)
          } catch (e) {}
          wx.navigateTo({
              url: '../../webView/webView'
          })
  },

  getPhoneNumber: function (e) {
    this.hideModal()
    this.decryptRequet(e.detail.encryptedData, e.detail.iv);
  },

  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  decryptRequet: function (encryptedData, iv) {
 
    var wjuserInfo = wx.getStorageSync('wjuserInfo');
    var self = this;
    var params = {
      'session_key': wjuserInfo.session_key,
      'iv': iv,
      'type': 'phone',
      'encryptedData': encryptedData
    }
    api.requestPost('api/weixin/decode-data', params, function (res) {
      if (res.data.status) {
        var tel = res.data.message.phone
        self.bindPhoneNumber(tel)
        try {
          wx.setStorageSync('userPhoneNumber', tel);
        } catch (error) {}
      }
    });
  },

  bindPhoneNumber: function (tel) {
    var self = this;
    var params = {
      uid: app.globalData.wjuserInfo.uid,
      phone: tel,
      is_verify_code:'0'
    }
    api.requestPost('api/login/bind-phone-xcx', params, function (res) {
        if (res.data.status) {
          self.activityDetail()
        }
    });
  },
})