
var utils = require('../../../utils/util.js')
var app = getApp();
var messageList = [], msgXiaoqlist = [],
  messageDirection = '',
  avatar = '',
  content = '',
  brandName = '',
  title = '';
var message = function (brandName, callBack) {
  var msg = {
    messageDirection: 0,
    avatar: '/images/dock-logo2.png',
    content: '欢迎您的咨询，我是无界商圈客服小Q，很高心为您服务。您对' + brandName + '有哪些需要了解的呢？留下您的疑惑，小Q尽快安排客服专员与您洽谈沟通'
  };
  callBack(msg);

},
  message1 = {
    messageDirection: 0,
    avatar: '/images/dock-logo2.png',
    content: '小Q正在为您安排客服专员，请耐心等候哦~您可以先对品牌问题进行留言，客服专员会在第一时间为您答疑解惑'
  };
Page({
  data: {
    userInfo: '',
    senderUserInfo: '',
    targetId: '',
    conversationType: 1,
    content: '',
    toView: '',
    messageInfo: '',
    cursorSpacing: 5,
    bottom: 0,
    scrollTop: 0,
    screenHeight: 0,
    scrollHeight: 0,
    windowHeight: 0,
    autoHeight: 0,
    hasMore: 0,
    moreDisplay: 'none',
    top: true,
    messageDirection: '',
    brandName: '',
    isGotoChat: false,
    confirmHold: true,
    isIpx: false,
    messageList : []
  },
  hideEmojis: function () {
    var that = this;
    var height = this.data.windowHeight - 47;
    that.setData({
      display: "none",
      moreDisplay: 'none',
      scrollHeight: height,
      bottom: 0
    });
  },
  // bindblur:function(e){
  //   console.log(e.detail)
  //   this.setData({
  //     content: '',
  //   });
  //   wx.hideKeyboard();
  // },
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  inputFocus: function () {
    var autoHeight = this.data.autoHeight;
    var height = this.data.windowHeight - 47 - autoHeight;
    this.setData({
      bottom: autoHeight,
      display: "none",
      moreDisplay: 'none',
      scrollHeight: height,
      toView: 'rcd-to-view'
    });
  },
  inputblur: function () {
    var autoHeight = this.data.autoHeight;
    var height = this.data.windowHeight - 47;
    this.setData({
      bottom: 0,
      display: "none",
      moreDisplay: 'none',
      scrollHeight: height,
      toView: 'rcd-to-view'
    });
  },
  bindInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },  
  sendMessage: function () {
    var context = this;
    console.log(context)
    var content = context.data.content;
    console.log(content);
    if (content === "") {
      wx.showModal({
        title: '提示',
        content: '发送消息不能为空',
        showCancel: false,
      });
      return;
    }
    if(app.globalData.user == null){
      var user = app.globalData.userInfo;
      console.log('xiaoQ1')
      console.log(user);
      var params = {
        context: context,
        avatar: user.avatarUrl,
        content: content,
        messageDirection: context.data.conversationType
      };
    }else {
      var user = app.globalData.user;
      console.log('xiaoQ2');
      console.log(user);
      var params = {
        context: context,
        avatar: user.avatar,
        content: content,
        messageDirection: context.data.conversationType
      };
    }
    
    // var params = {
    //   context: context,
    //   avatar: user.avatar,
    //   content: content,
    //   messageDirection: context.data.conversationType
    // };
    messageList.push(params);
    if (params.messageDirection == 1) {
      msgXiaoqlist.push(params.content);
      wx.setStorageSync('msgXiaoqlist', msgXiaoqlist);
    }

    if (messageList.length == 2) {
      messageList.push(message1);
    }
    this.setData({
      messageList: messageList,
      content: '',
    });
  },
  onLoad: function (options) {
    console.log('liebiao')
    console.log(messageList);
    wx.removeStorageSync('msgXiaoqlist');
    messageList = [];
    var that = this;
    console.log(messageList);
    // 生命周期函数--监听页面加载
    brandName = options.brandName;
    message(brandName, function (res) {
      messageList.push(res);
    });
    if (app.globalData.user == null) {
      console.log('xiaoQ3')
      console.log(app.globalData.userInfo);
      this.setData({
        messageList: messageList,
        userInfo: app.globalData.userInfo,
        avatar: app.globalData.userInfo.avatarUrl
      })
    } else {
      console.log('xiaoQ4')
      console.log(app.globalData.user);
      this.setData({
        messageList: messageList,
        userInfo: app.globalData.user,
        avatar: app.globalData.user.avatar
      })
    }
    if (options.brandName) {
      wx.setNavigationBarTitle({
        title: options.brandName
      })
    }
    app.addListener(function (message) {
      console.log(message);

      if ((message.objectName == "TextMessage" || message.content.messageName == 'TextMessage') && message.messageType != 'UnknownMessage') {
        var _i = message.content.content.indexOf('我是您');
        var index = (_i != -1) ? true : false;
        if (index) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: message.content.user.name + '将为您进行后续品牌跟进服务。加盟品牌，品牌了解，您的任何问题一网打尽',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定');
                that.data.isGotoChat = true;
                var urlTpl = '../chat/chat?targetId={0}&conversationType={1}&title={2}',
                  url = utils.stringFormat(urlTpl, [message.targetId, 1, message.content.user.name]);
                wx.navigateTo({
                  url: url
                });
              }
            }
          })
        }

      }
    })
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
  },
  onShow: function (res) {
    // 生命周期函数--监听页面显示
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        var percent = 0;
        if(res.screenHeight == 812){
          that.setData({
            isIpx:true
          })
        }
        if (res.system.indexOf('iOS') != -1) {
          percent = 0.412;
        } else if (res.brand == 'Xiaomi') {
          percent = 0.42;
        } else if (res.brand == 'Meizu') {
          percent = 0.39;
        } else {
          percent = 0.41;
        }
        that.setData({
          imageWidth: res.screenWidth / 2 - 86,
          windowHeight: res.windowHeight,
          screenHeight: res.screenHeight,
          emojiWidth: Math.floor((res.screenWidth - 104) / 8),
          scrollHeight: res.windowHeight - 47,
          autoHeight: Math.round(res.screenHeight * percent),
          cursorSpacing: (Math.round(res.screenHeight * percent) - 5) * -1
        });
      }
    });
    var brandName = 'res.brandName';
    that.setData({
      brandName: brandName
    })
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏
  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载
    // if (this.data.isGotoChat == false) {
    //   wx.removeStorageSync('msgXiaoqlist');
    // }
  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  }
})