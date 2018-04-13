var RongIMLib = require("../../../pages/RongIMLib.xiaochengxu-1.0.0.js");
var commentRequest = require('../../../utils/commonRequest.js');
var utils = require('../../../utils/util.js');
var RongIMClient = RongIMLib.RongIMClient;
var WxNotificationCenter = require('../WxNotificationCenter.js');
var Config = require('../../../utils/config');

function rcimConnect(that, token) {

  var self = this;
  if (!that.globalData.connect) {
    // var num = 0;
    // var token = that.globalData.userList[num].token;
    //公有云
    RongIMLib.RongIMClient.init(Config.TYRCIMAppKey);
    var instance = RongIMClient.getInstance();

    // 连接状态监听器
    RongIMClient.setConnectionStatusListener({
      onChanged: function (status) {
        console.log('链接状态 ' + status);
        console.log("setConnectionStatusListener");
        switch (status) {
          case RongIMLib.ConnectionStatus.CONNECTED:
            console.log("链接成功")

            break;
          case RongIMLib.ConnectionStatus.CONNECTING:
            console.log('正在链接');
            break;
          case RongIMLib.ConnectionStatus.DISCONNECTED:
            console.log('断开连接');
            // reconnect();
            break;
          case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
            console.log('其他设备登录');
            if (self.otherLoginCallBack) {
              self.otherLoginCallBack();
            }
            break;
          case RongIMLib.ConnectionStatus.DOMAIN_INCORRECT:
            console.log('域名不正确');
            break;
          case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
            console.log('网络不可用');
            break;
          case RongIMLib.ConnectionStatus.CONNECTION_CLOSED:
            console.log('连接关闭');
            RCIMToolsReconnect(that);
            break;
        }
      }
    });

    RongIMClient.setOnReceiveMessageListener({
      // 接收到的消息
      onReceived: function (message) {
        // 判断消息类型
        console.log("接受到新的消息")
        console.log(message);
        getTotalUnreadCount(function (res) {
          console.log("设置小红点");
          wx.setTabBarBadge({
            index: 1,
            text: res
          })

        });
        that.setChangedData(message);
        if (message.objectName == "RC:TxtMsg" && message.messageType != 'UnknownMessage') { // 更新联系人列表
          var index = (message.content.content.indexOf('我是您') != -1) ? true : false;
          if (index) {
            getAgentList(that.globalData.wjuserInfo.uid, function (res) {
              that.globalData.agentList = res;
              //发送通知（所有注册过'NotificationName'的页面都会接收到通知）
              WxNotificationCenter.postNotificationName('NotificationName', that.globalData.agentList);
            });
          }
        }
        // if (message.messageType != 'UnknownMessage') {

        // }
      }
    });

    //开始链接
    RongIMClient.connect(token, {
      onSuccess: function (userId) {
        console.log("链接成功，用户id：" + userId);
        that.globalData.connect = true;
        registerRichMessage();
        registerTipMessage();
        getTotalUnreadCount(function (res) {
          wx.setTabBarBadge({
            index: 1,
            text: res
          })
        });

      },
      onTokenIncorrect: function () {
        console.log('token无效');
      },
      onError: function (errorCode) {
        var info = '';
        switch (errorCode) {
          case RongIMLib.ErrorCode.TIMEOUT:
            info = '超时';
            break;
          case RongIMLib.ErrorCode.UNKNOWN_ERROR:
            info = '未知错误';
            break;
          case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
            info = '不可接受的协议版本';
            break;
          case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
            info = 'appkey不正确';
            break;
          case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
            info = '服务器不可用';
            break;
        }
        console.log(errorCode);
      },

    });

    // 网络状态监听
    wx.onNetworkStatusChange(function (res) {
      console.log(res.isConnected)
      console.log(res.networkType)
      if (res.isConnected) {
        if (RongIMClient.getCurrentConnectionStatus == RongIMLib.ConnectionStatus.DISCONNECTED) {
          RCIMToolsReconnect(that);
        }
      }
    })

  }
}

function RCIMToolsReconnect(that) {
  /*
	1: reconnect 是重新连接，并没有重连机制，调用此方法前应该进行网络嗅探，网络正常再调用 reconnect。
	2: 提示其他设备登录请勿调用重连方法。
 	3: docs   http://www.rongcloud.cn/docs/api/js/RongIMClient.html
	*/

  var callback = {
    onSuccess: function (userId) {
      console.log("重新链接成功，用户id：" + userId);
      console.log("重新链接 成功", userId);
      that.globalData.connect = true;
      getTotalUnreadCount(function (res) {
        wx.setTabBarBadge({
          index: 1,
          text: res
        })
      });
      WxNotificationCenter.postNotificationName('refreshMsgList');
    },
    onTokenIncorrect: function () {
      //console.log('token无效');
      console.log("重新链接 失败", "token无效");
    },
    onError: function (errorCode) {
      var info = '';
      switch (errorCode) {
        case RongIMLib.ErrorCode.TIMEOUT:
          info = '超时';
          break;
        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
          info = '未知错误';
          break;
        case RongIMLib.ErrorCode.UNACCEPTABLE_PROTOCOL_VERSION:
          info = '不可接受的协议版本';
          break;
        case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
          info = 'appkey不正确';
          break;
        case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
          info = '服务器不可用';
          break;
      }
      console.log("重新链接 失败", info);
    }
  };
  var config = {
    // 默认 false, true 启用自动重连，启用则为必选参数
    auto: true,
    // 网络嗅探地址 [http(s)://]cdn.ronghub.com/RongIMLib-2.2.6.min.js 可选
    url: 'https://cdn.ronghub.com/RongIMLib-2.2.6.min.js',
    // 重试频率 [100, 1000, 3000, 6000, 10000, 18000] 单位为毫秒，可选
    rate: [100, 1000, 3000, 6000, 10000]
  };
  RongIMClient.reconnect(callback,config);

}

function disconnect() {
  /*
  文档：http://www.rongcloud.cn/docs/api/js/RongIMClient.html
  */
  var instance = RongIMClient.getInstance();
  instance.disconnect();
  console.log("断开链接 成功");
}
// 格式化时间
function getTime(time) {
  time = parseInt(time);
  var today = new Date(utils.dateFormat(new Date(), 'yyyy/MM/dd'));
  var thisTime = today.getTime();
  if (thisTime - time < 0) {
    return utils.dateFormat(new Date(time), 'hh:mm');
  } else if (thisTime - time < 24 * 60 * 60 * 1000) {
    return '昨天';
  } else {
    return utils.dateFormat(new Date(time), 'yy/MM/dd');
  }
}
// 获取联系人列表
function getAgentList(uid, success) {
  var data = {
    'uid': uid
  };
  var url = 'api/user/my-all-agents';
  commentRequest.requestPost(url, data, function (res) {

    var list = res.data.message.agent_list;
    var userList = [];
    if (list) {
      for (let i = 0; i < list.length; i++) {
        const element = list[i];
        var subList = element.list;
        for (let j = 0; j < subList.length; j++) {
          const user = subList[j];
          var userInfo = {
            'name': user.nickname,
            'userId': "agent" + user.id,
            'avatar': user.avatar,
            'isPub': user.isPub
          }
          userList.push(userInfo);

        }
      }
      console.log(userList);
      success(userList);
    }
  })
}

function registerMessage(type, propertys) {
  var messageName = type; // 消息名称。
  var objectName = "s:" + type; // 消息内置名称，请按照此格式命名 *:* 。
  var mesasgeTag = new RongIMLib.MessageTag(true, true); //true true 保存且计数，false false 不保存不计数。

  RongIMClient.registerMessageType(messageName, objectName, mesasgeTag, propertys);
}
// 融云注册自定义消息
function registerRichMessage() {

  var propertys = ["title", "digest", "imageURL", "url", "type", "extra", "joinType", "totalCost", "customerName"]; // 消息类中的属性名。
  registerMessage("TYRichMsg", propertys);
}

function registerTipMessage() {
  var propertys = ["content", "extra"];
  registerMessage("TY:TipMsg", propertys);
}

function getTotalUnreadCount(success) {

  RongIMClient.getInstance().getTotalUnreadCount({
    onSuccess: function (count) {
      console.log("获取总未读数成功", count);
      var countStr = String(count);
      if (count > 0) {
        success(countStr);
      } else {
        wx.removeTabBarBadge({
          index: 1,
          success: function () {
            console.log('移除成功');
          },
          fail: function () {
            console.log('移除失败');
          }
        })
      }

    },
    onError: function (error) {
      console.log("获取总未读数失败", error);
    }
  });
}

module.exports = {
  rcimConnect: rcimConnect,
  getTime: getTime,
  getAgentList: getAgentList,
  RCIMToolsReconnect: RCIMToolsReconnect,
  disconnect: disconnect,
  getTotalUnreadCount: getTotalUnreadCount
}