var RongIMLib = require("../../RongIMLib.xiaochengxu-1.0.0.js");
var emoji = require("../../../utils/emoji.js");
var RongIMClient = RongIMLib.RongIMClient;
var utils = require('../../../utils/util.js');
var config = require('../../config.js');
// var mock = require('../../../utils/mock.js');
var utilApi = require("../../../utils/commonRequest.js");
var RCIMTools = require('../../../pages/untils/RCIMTools/RCIMTools.js');
var WxNotificationCenter = require('../../untils/WxNotificationCenter.js');
emoji.init();
var uid = '';
var app = getApp()

function getConversationList(callback) {
  var conversationTypes = null;  //具体格式设置需要补充
  var limit = 10; //获取会话的数量

  // RongIMClient.getInstance().removeConversation(RongIMLib.ConversationType.PRIVATE, "GVJccf6KwCHLYmWaRAfTeX", {
  //   onSuccess: function (bool) {
  //     // 删除会话成功。
  //   },
  //   onError: function (error) {
  //     // error => 删除会话的错误码
  //   }
  // });

  //获取聊天列表
  RongIMClient.getInstance().getConversationList({
    onSuccess: function (list) {
      console.log(list);
      console.log("getConversationList")
      for (var i = 0; i < list.length; i++) {
        if (list[i].targetId == '') {
          list.splice(i, 1);
          break;
        }
      }
      if (list.length > 0) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].conversationType == 1) {
            if (list[i].latestMessage.content.user && list[i].latestMessage.content.user.userId == list[i].targetId) {
              list[i].user = list[i].latestMessage.content.user;
            } else {
              list[i].user = getUser(list[i].targetId);
            }
          } else if (list[i].conversationType == 1) {
            list[i].user = getUser(list[i].targetId);
          }
          if (list[i].latestMessage.messageType == 'ImageMessage') {
            list[i].latestMessage.content.content = '[图片]';
          } else if (list[i].latestMessage.content.content) {
            list[i].latestMessage.content.content = emoji.unicodeToEmoji(list[i].latestMessage.content.content);
          }
          if (list[i].latestMessage.sentTime) {
            list[i].latestMessage.time = RCIMTools.getTime(list[i].latestMessage.sentTime);
          }
        }
        callback && callback(list);
      }
      
    },
    onError: function (error) {
      console.log("getConversationList error")
      console.log(error)
    }
  }, null);
}
function getUser(id) {
  var userList = app.globalData.agentList;

  for (var i = 0; i < userList.length; i++) {
    if (userList[i].userId == id) {
      return userList[i];
    }
  }
}

var addConversation = (list) => {  //接收消息
  var data = {
    conversationType: RongIMLib.ConversationType.PRIVATE,
    latestMessage: {
      sentTime: '',
      messageType: 'TextMessage',
      content: ''
    },
    receivedStatus: 1,
    targetId: '',
    sentTime: '',
    unreadMessageCount: 0
  };
  var userList = app.globalData.agentList; //用户列表

  // console.log(app.globalData.wjuserInfo.uid)

  for (var i = 0; i < userList.length; i++) {
    if (userList[i].userId == app.globalData.wjuserInfo.uid) {
      continue;
    }
    var hasUser = false;
    for (var j = 0; j < list.length; j++) {
      if (userList[i].userId == list[j].targetId) {
        hasUser = true;
        break;
      }
    }
    if (!hasUser) {
      data.targetId = userList[i].userId;
      data.user = getUser(userList[i].userId);
      list.push(data);
      break;
    }

  }

};

Page({
  data: {
    motto: '',
    icon: '',
    userInfo: {},
    conversationList: [],
    inputVal: '',
    inputShowed: false,
    scrollHeight: 0,
    memberAvatars: [],
    //左滑删除
    // startX: 0, //开始坐标
    // startY: 0,
    define:false
  },

  // onShareAppMessage: function (res) {
  //   if (res.from === 'button') {
  //     // 来自页面内转发按钮
  //     console.log(res.target)
  //   }
  //   return {
  //     title: 'http://www.rongcloud.cn/',
  //     path: '/pages/im/index',
  //     imageUrl: 'http://f2e.cn.ronghub.com/desktop-client-qa/css/images/logo.png',
  //     success: function (res) {
  //       // 转发成功
  //     },
  //     fail: function (res) {
  //       // 转发失败
  //     }
  //   }
  // },  
  //初始化数据
  init: function () {
    // this.detail(uid);
    var that = this;
    that._im = RongIMClient.getInstance();
    var callback = function (list) {
      // while (list.length < 8) {
      //   addConversation(list);
      // }
      addConversation(list);
      for (let i = 0; i < list.length; i++) {
        const element = list[i];
        for (let j = 0; j < app.globalData.agentList.length; j++) {
          const user = app.globalData.agentList[j];
          if (user.userId == element.targetId) {
            element.user = user;
          }
        }
      }
      that.setData({
        conversationList: list
      });
      console.log(that.data.conversationList);
      // if (that.data.conversationList.length<=0) {
      //   that.setData({
      //     define:true
      //   })
      // }
    };
    getConversationList(callback); //接受历史消息
    //监听收到的消息
    app.addListener(function (message) {
      console.log(message);
      var callback = function (list) {
        console.log(list);
        that.setData({
          conversationList: list
        });
        console.log(that.data.conversationList)
        // if (that.data.conversationList<=0) {
        //   that.setData({
        //     define:true
        //   })
        // }else {
        //   that.setData({
        //     define:false
        //   })
        // }
      };
      getConversationList(callback);
    });
    RCIMTools.getTotalUnreadCount(function(res){
     
    });
    
  },
  onLoad: function (options) {
    var uid = options.uid;
    var that = this;
    var t;
    var memberAvatars = [];
    for (var i = 0; i < app.globalData.agentList.length; i++) {
      memberAvatars.push(app.globalData.agentList[i].avatar); //添加用户头像
    }
    that.setData({
      memberAvatars: memberAvatars
    });
    t = setInterval(function () {
      if (app.globalData.connect) {
        clearInterval(t);
        that.init();
      }
    }, 500);

    WxNotificationCenter.addNotification('refreshMsgList', that.didNotification, that);
    //左滑删除
    // for (var i = 0; i < 10; i++) {
    //   this.data.items.push({
    //     content: i + " 向左滑动删除哦,向左滑动删除哦,向左滑动删除哦,向左滑动删除哦,向左滑动删除哦",
    //     isTouchMove: false //默认全隐藏删除
    //   })
    // }
    // this.setData({
    //   items: this.data.items
    // })
  },
  didNotification: function () {
    //更新数据
    console.log('收到通知');
    this.refreshMsgList();
   },
  onUnload: function () {
 //移除通知
 var that = this
 WxNotificationCenter.removeNotification('refreshMsgList', that)
},
  onUnload: function () {
    //移除通知
    var that = this
    WxNotificationCenter.removeNotification('refreshMsgList', that)
   },
  onShow: function () {
    this.refreshMsgList();
  },
  refreshMsgList:function(){
    var that = this;
    var callback = function (list) {
      that.setData({
        conversationList: list
      });
    };
    if (that._im) {
      getConversationList(callback);
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight - 50
        });
      }
    });
    that.setData({
      inputVal: "",
      inputShowed: false
    });
    that.init(); 
  },
  // goApi: function(){
  //   wx.navigateTo({
  //     url: './api/test'
  //   });
  // },
  naviTo: function (e) {
    console.log(e);
    var data = e.currentTarget.dataset;
    var targetId = data.targetid;
    var conversationType = data.conversationtype;
    RongIMClient.getInstance().clearUnreadCount(conversationType, targetId, {
      onSuccess: function () {
        console.log('清除未读消息成功');
        // 清除未读消息成功。
        RCIMTools.getTotalUnreadCount(function(res){
          wx.setTabBarBadge({
            index: 1,
            text: res
          })
        });
      },
      onError: function (error) {
        // error => 清除未读消息数错误码。
      }
    });

    var urlTpl = '../chat/chat?targetId={0}&conversationType={1}&title={2}';
    var chatTitle = ' ';
    if (data.name) {
      chatTitle = data.name;
    };
    var  url = utils.stringFormat(urlTpl, [targetId, conversationType, chatTitle]);
    wx.navigateTo({
      url: url
    });
  },
  //手指触摸动作开始 记录起点X坐标
  // touchstart: function (e) {
  //   //开始触摸时 重置所有删除
  //   this.data.conversationList.forEach(function (v, i) {
  //     if (v.isTouchMove)//只操作为true的
  //       v.isTouchMove = false;
  //   })
  //   this.setData({
  //     startX: e.changedTouches[0].clientX,
  //     startY: e.changedTouches[0].clientY,
  //     conversationList: this.data.conversationList
  //   })
  // },
  // //滑动事件处理
  // touchmove: function (e) {
  //   // console.log(e)
  //   var that = this,

  //     index = e.currentTarget.dataset.index,//当前索引
  //     startX = that.data.startX,//开始X坐标
  //     startY = that.data.startY,//开始Y坐标
  //     touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
  //     touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
  //     //获取滑动角度
  //     angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
  //   that.data.conversationList.forEach(function (v, i) {
  //     v.isTouchMove = false
  //     //滑动超过30度角 return
  //     if (Math.abs(angle) > 30) return;
  //     if (i == index) {
  //       if (touchMoveX > startX) //右滑
  //         v.isTouchMove = false
  //       else //左滑
  //         v.isTouchMove = true
  //     }

  //   })
  //   //更新数据
  //   that.setData({
  //     conversationList: that.data.conversationList
  //   })
  // },
  // // /**
  // //  * 计算滑动角度
  // //  * @param {Object} start 起点坐标
  // //  * @param {Object} end 终点坐标
  // //  */
  // angle: function (start, end) {
  //   var _X = end.X - start.X,
  //     _Y = end.Y - start.Y
  //   //返回角度 /Math.atan()返回数字的反正切值
  //   return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  // },
  // //删除事件
  // del: function (e) {
  //   var targetId = e.currentTarget.dataset.ids;
  //   console.log(e.currentTarget.dataset.ids);
  //   var that = this;
  //   for (var i = 0; i < this.data.conversationList.length; i++) {
  //     if (this.data.conversationList[i].targetId == targetId) {
  //       console.log(i);
  //       var conversationMsg = this.data.conversationList[i];
  //       this.data.conversationList.splice(i, 1);
  //       this.setData({
  //         conversationList: this.data.conversationList
  //       });
  //     }
  //   }
  //   console.log(conversationList)
  // },

})