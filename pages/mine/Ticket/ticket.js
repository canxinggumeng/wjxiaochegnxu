var api = require('../../../utils/commonRequest.js');
var config = require("../../../utils/config.js");
const app = getApp();

var scanAid = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    nomessage:false,
    showModal:false,
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.requestData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      this.data.page++
      this.requestData()
  },

  requestData() {
    var self = this
    var params = { 
      'type': 'my', 
      'uid': app.globalData.wjuserInfo.uid,
      'page':self.data.page
    }
    api.requestPost("api/user/userticketlist", params, function (res) {
      if (res.data.status) {
        var array = res.data.message
        if (self.data.page == 1 && array.length == 0) {
          self.setData({
            nomessage: true
          })
          return
        }
        
        var array_temp = []
        for (var i = 0; i < array.length; i++) {
          var item = array[i]
          var ticket_info = '免费'
          var typee = '0'
          if (item.ticket_type == '现场票') {
            if (item.pay_way == '微信支付' || item.pay_way == '支付宝支付') {
              ticket_info = item.ticket_name + ' ' + item.price
            } else {
              ticket_info = item.ticket_name + ' ' + item.score_price
            }
            typee = item.is_over
          } else {
            typee = '1'
            if (item.pay_way == '微信支付' || item.pay_way == '支付宝支付') {
              ticket_info = item.price
            } else {
              ticket_info = item.score_price
            }
          }
          var font_red = false
          if (item.ticket_status == '活动即将开始，未签到，请及时赴会签到') {
            font_red = true
          }

          var item_new = {
            'name': item.subject,
            'time': item.begin_time,
            'ticket_type': item.ticket_type,
            'ticket_info': ticket_info,
            'type': typee,
            'activity_id': item.activity_id,
            'ticket_status': item.ticket_status,
            'font_red':font_red
          }
          array_temp.push(item_new)
        }
        self.setData({
          nomessage: false,
          list: self.data.list.concat(array_temp)
        })
      }
    })
  },

  checkActivityDetail:function(e) {
    var aid = e.currentTarget.dataset.aid
    this.activityDetail(aid)
  },

  activityDetail:function(aid) {
    var href = config.TYHostURL + 'webapp/activity/detail' + config.TYVersion + '?id=' + aid + '&uid=' + app.globalData.wjuserInfo.uid
    try {
      wx.setStorageSync('url', href)
    } catch (e) { }
    wx.navigateTo({
      url: '../../webView/webView'
    })
  },

  activitySign:function() {
    var self = this
    wx.scanCode({
      success: (res) => {
        var path = res.result
        if (path.indexOf('activityinfo:') != -1) {
          scanAid = path.match(/\bactivity_id=\d+/)[0]
          scanAid = scanAid.substring(12)
          var maker_id = path.match(/\maker_id=\d+/)[0]
          maker_id = maker_id.substring(9)
          var params = { 'activity_id': scanAid, 'maker_id': maker_id, 'uid': app.globalData.wjuserInfo.uid }
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

  activityInfoAlert: function () {
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
            self.activityDetail(scanAid)
          } else {
            self.setData({
              showModal: true
            })
          }
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

  hideModal: function () {
    this.setData({
      showModal: false
    });
  }
})