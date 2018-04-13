var RongIMLib = require("../../RongIMLib.xiaochengxu-1.0.0.js");
var emoji = require("../../../utils/emoji.js");
var RongIMClient = RongIMLib.RongIMClient;
var utils = require('../../../utils/util.js');
var config = require('../../config.js');
var commonRequest = require('../../../utils/commonRequest.js')
var configUrl = require('../../../utils/config.js');
var bindPhoneNumber = require('../../untils/BindPhone/BindPhone.js')
var RCIMTools = require('../../untils/RCIMTools/RCIMTools.js');
var WxNotificationCenter = require('../../../pages/untils/WxNotificationCenter.js');
console.log(emoji.names);
var navigatClick = false;
//reg = \uf000-\uf700;
// console.log(emoji.unicodeToEmoji("\uf604"));
// console.log(emoji.unicodeToEmoji("\uf700"));
// console.log(emoji.unicodeToEmoji("\uf701"));

var emojis = emoji.emojis;
var FileType = RongIMLib.FileType;

var JSONUtil = {
  stringify: JSON.stringify,
  parse: JSON.parse
};

var targetId = "";
var title = "";
var getHistoryCont = 0;
var getHistoryMessage = (context, timestrap, count, callback) => {
  var that = this;
  console.log(targetId);
  //历史消息
  RongIMClient.getInstance().getHistoryMessages(context.data.conversationType, targetId, timestrap, count, {
    onSuccess: function (list, hasMsg) {
      console.log("获取历史消息成功");
      console.log(hasMsg);
      // for (var i = 0; i < list.length; i++) {
      //   if (list[i].messageType == 'UnknownMessage') {
      //     list.splice(i, 1);
      //     break;
      //   }
      // }
      callback && callback(list, hasMsg);
    },
    onError: function (error) {
      console.log("获取历史消息失败");
      console.log(error);
      // getHistoryCont++;
      // console.log('调用次数' + getHistoryCont);
      // if (getHistoryCont<=4){
      //   RCIMTools.reconnect(function (res) {
      //     getHistoryMessage(that, null, 20, callback);
      //   })
      // } else if (getHistoryCont == 5){
      //     RCIMTools.disconnect();
      //     app.connectRCIM(app.globalData.wjuserInfo.token);
      // };
      
    }
  });
}
//发送信息
var sendMessage = (params, callback) => {
  callback = callback || utils.noop;
  var { targetId, type, context, msg } = params;
  var data = context.data;
  console.log(params);
  context._im.sendMessage(type, targetId, msg, {
    onSuccess: (message) => {
      console.log(message);
      var list = data.messageList;
      message.content.content = emoji.unicodeToEmoji(message.content.content);
      list.push(message);
      modifyMessage(list, context);
      context.setData({
        messageList: list,
        content: '',
        toView: list[list.length - 1].messageUId
      });
    },
    onError: (error, message) => {
      console.error(error);
    }
  });
};

var getFileKey = (path) => {
  return path.substring(9);
};

var uploadFile = (params, callback) => {
  var { path, im, type } = params;
  var upload = (token) => {
    var key = getFileKey(path);
    var formdata = {
      token: token,
      key: key
    };
    var url = config.uploadURL;
    console.log(path);
    wx.uploadFile({
      url: url,
      filePath: path,
      name: 'file',
      formData: formdata,
      success: function (res) {
        console.log(res);
        var data = res.data
        callback(data);
      }
    });
  };
  im.getFileToken(type, {
    onSuccess: (ret) => {
      var token = ret.token;
      upload(token);
    },
    onError: (error) => {
      console.error('getFileToken error' + error);
    }
  });
};

var getFileUrl = (params, callback) => {
  var { info, im, type } = params;
  var { hash, oriname } = info;
  im.getFileUrl(type, hash, null, {
    onSuccess: (ret) => {
      var error = null;
      callback(error, ret);
    },
    onError: (error) => {
      console.error('getFileUrl error' + error);
    }
  });
};
var getBase64Image = (params, callback) => {
  //file对象没有高宽
  // var canvas = document.createElement("canvas");
  // var url = params.url;
  // var img = new Image();
  // img.src = url;
  // var width = img.width;
  // var height = img.height;
  // var newImageData = compress(img, width, height);
  // callback(error, newImageData);

  // function compress(img, width, height) {
  //   canvas.width = width;
  //   canvas.height = height;

  //   var context = canvas.getContext('2d');
  //   context.drawImage(img, 0, 0, width, height);

  //   var supportTypes = {
  //     "image/jpg": true,
  //     "image/png": true,
  //     "image/webp": supportWebP()
  //   };
  //   var exportType = "image/jpg";
  //   var newImageData = canvas.toDataURL(exportType);
  //   return newImageData;
  // }

  // function supportWebP() {
  //   try {
  //     return (canvas.toDataURL('image/webp').indexOf('data:image/webp') == 0);
  //   } catch (err) {
  //     return false;
  //   }
  // }
};
var createImage = (params) => {
  var { context, url } = params;
  var { targetId } = context.data;
  var user = app.globalData.user;
  var msg = new RongIMLib.ImageMessage({ content: '', imageUri: url, user: user });
  var params = {
    context: context,
    type: context.data.conversationType,
    targetId: targetId,
    msg: msg
  };
  sendMessage(params);
  // getBase64Image(params, (error, base64) => {

  // });
};
var sendImage = (params) => {
  var { context } = params;
  var im = context._im;
  console.log(FileType.IMAGE);
  params = {
    im: im,
    type: FileType.IMAGE
  };
  wx.chooseImage({
    count: 1, // 默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      var path = res.tempFilePaths[0];
      params.path = path;
      uploadFile(params, (info) => {
        params.info = JSONUtil.parse(info);
        params.info['oriname'] = '';
        console.log(params);
        getFileUrl(params, (error, ret) => {
          console.log(ret.downloadUrl);
          var params = {
            context: context,
            url: ret.downloadUrl
          };
          createImage(params);
        });
      });
    }
  });
};

var sendFile = (context) => {
  //TODO
};

var modifyMessage = (list, context) => {

  // 删除无定义的消息类型
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    
    // if (element.content != undefined){
    //   let cont = element.content.content;
    //   if ((element.objectName == 'TY:TipMsg' && element.messageDirection == 1) || element.objectName == 'RC:LBSMsg' || element.objectName == 'RC:VcMsg' || (element.objectName == 'TY:RichMsg' && element.messageDirection == 1) || (cont.indexOf('浏览品牌') != -1 && element.messageDirection == 1)) {
    //     list.splice(i, 1);
    //   }
    // }
    
  }
  var otherInterval = 3 * 60 * 1000;
  var myInterval = 5 * 60 * 1000;
  var myAccountId = targetId;
  var oldSentTime;
  list.forEach(function (item, index) {
    if (item.content.user) {
      console.log(item.content.user)
      item.user = item.content.user;
    } else if (item.senderUserId) {
      item.user = getUser(item.senderUserId);
    } else {
      item.user = getUser(targetId);
    }
    item.time = getTime(item.sentTime);
    item.messageUId = 'RC' + item.messageUId;
    if (index === 0) {
      oldSentTime = item.sentTime;
      item._showTime = true;
      return;
    }
    var interval = item.senderUserId === myAccountId ? myInterval : otherInterval;
    var sentTime = item.sentTime || (new Date).getTime();
    if (sentTime - oldSentTime > interval) {
      oldSentTime = item.sentTime;
      item._showTime = true;
    } else {
      item._showTime = false;
    }
  });
};

function getTime(time) {
  var today = new Date(utils.dateFormat(new Date(), 'yyyy/MM/dd'));
  var thisTime = today.getTime();
  if (thisTime - time < 0) {
    return utils.dateFormat(new Date(time), 'hh:mm');
  } else if (thisTime - time < 24 * 60 * 60 * 1000) {
    return '昨天 ' + utils.dateFormat(new Date(time), 'hh:mm');
  } else if (thisTime - time < 6 * 24 * 60 * 60 * 1000) {
    var week = new Date(time).getDay();
    switch (week) {
      case 0:
        week = '星期日';
        break;
      case 1:
        week = '星期一';
        break;
      case 2:
        week = '星期二';
        break;
      case 3:
        week = '星期三';
        break;
      case 4:
        week = '星期四';
        break;
      case 5:
        week = '星期五';
        break;
      case 6:
        week = '星期六';
        break;
    }
    return week + ' ' + utils.dateFormat(new Date(time), 'hh:mm');
  } else {
    return utils.dateFormat(new Date(time), 'yy/MM/dd hh:mm');
  }
}

function getUser(id) {
  var userList = app.globalData.agentList;
  for (var i = 0; i < userList.length; i++) {
    var userRCID = userList[i].userId;
    if (userRCID == id) {
      return userList[i];
    }
  }
}

var app = getApp();
Page({
  data: {
    motto: 'Hello World',
    userInfo: '',
    senderUserInfo: '',
    messageList: [],
    targetId: '',
    conversationType: 1,
    content: '',
    toView: '',
    messageInfo: '',
    indicatorDots: true,
    autoplay: false,
    duration: 180,
    current: 0,
    cursorSpacing: 5,
    bottom: 0,
    scrollTop: 0,
    screenHeight: 0,
    emojiWidth: 0,
    scrollHeight: 0,
    windowHeight: 0,
    autoHeight: 0,
    loading: false,
    hasMore: 0,
    display: 'none',
    moreDisplay: 'none',
    imageWidth: 0,
    top: true,
    telOpen: false,
    showModal: false,
    activity_invita: '',
    agentName: '',
    confirmHold: true,
    isIpx:false
  },
  refresh: function () {
    var that = this;
    if (that.data.loading) {
      return;
    }
    var callback = function (list, hasMsg) {
      if (list.length > 0) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].content.content) {
            list[i].content.content = emoji.unicodeToEmoji(list[i].content.content);
          }
        }
        modifyMessage(list, that);
        var oldList = that.data.messageList;
        console.log('fanhui')
        console.log(oldList)
        var messageUId = oldList[0].messageUId;
        oldList = list.concat(oldList);
        that.setData({
          messageList: oldList
        });
        console.log('2ge');
        that.setData({
          toView: messageUId
        });
      }
      that.setData({
        hasMore: hasMsg,
        loading: false
      });
    }
    console.log(that.data.hasMore);
    if (that.data.hasMore) {
      that.setData({
        loading: true
      });
      getHistoryMessage(that, null, 20, callback);
    }
  },
  scroll: function (event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  sendImage: function () {
    var context = this;
    var params = {
      context: context
    };
    sendImage(params);
  },
  disconnect: function () {
    var context = this;
    var im = context._im;
    im.disconnect();
  },
  reconnect: function () {
    RongIMClient.reconnect(connectCallback);
  },
  sendFile: function () {
    sendFile(this);
  },
  inputFocus: function () {
    var autoHeight = this.data.autoHeight;
    var height = this.data.windowHeight - 52 - autoHeight;
    this.setData({
      bottom: autoHeight,
      display: "none",
      moreDisplay: 'none',
      scrollHeight: height,
      toView: 'rcd-to-view'
    });
  },
  inputblur:function(){
    var autoHeight = this.data.autoHeight;
    var height = this.data.windowHeight - 52;
    this.setData({
      bottom: 0,
      display: "none",
      moreDisplay: 'none',
      scrollHeight: height,
      toView: 'rcd-to-view'
    });
  },
  sendMessage: function () {
    var context = this;
    var { content, targetId } = context.data;
    console.log(context.data);
    if (content === "") {
      // wx.showModal({
      //   title: '提示',
      //   content: '发送消息不能为空',
      //   showCancel: false,
      // });
      return;
    }
    var user = app.globalData.user;
    var msg = new RongIMLib.TextMessage({ content: content, user: user });
    var params = {
      context: context,
      type: context.data.conversationType,
      targetId: targetId,
      msg: msg
    };
    sendMessage(params);
  },
  bindInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },
  navigateBack: function () {
    var context = this;
    // context._im.disconnect();
    //删除缓存，临时做法。
    // utils.cache.removeAll();
    var url = '../index';
    wx.navigateBack({
      url: url
    });
  },
  getEmoji: function () {
    var that = this;
    var list = that.data.messageList;
    var height = this.data.windowHeight - 277;
    that.setData({
      scrollHeight: height
    });

    wx.getSystemInfo({
      success: res => {
        var bh = 0;
        if (res.system.indexOf('iOS') != -1 && res.screenHeight == 812) {
          bh = 34
        }
        that.setData({
          display: "block",
          moreDisplay: 'none',
          bottom: bh
        });
      }
    });

    if (list.length != 0) {
      that.setData({
        toView: list[list.length - 1].messageUId
      });
    }
  },
  expandMore: function () {
    var that = this;
    var list = that.data.messageList;
    var height = this.data.windowHeight - 277;
    that.setData({
      scrollHeight: height
    });
    that.setData({
      moreDisplay: "block",
      display: 'none',
      bottom: 0
    });
    if (list.length != 0) {
      that.setData({
        toView: list[list.length - 1].messageUId
      });
    }
  },
  selectEmoji: function (event) {
    var that = this;
    var content = that.data.content;
    var emojiItem = (event.target.dataset.emoji);
    content = content + emojiItem;
    that.setData({
      content: content
    });
  },
  hideEmojis: function () {
    var that = this;
    var height = this.data.windowHeight - 52;
    that.setData({
      display: "none",
      moreDisplay: 'none',
      scrollHeight: height,
      bottom: 0
    });
  },
  imgLoadError: function (e) {
    console.log(e);
  },
  viewImg: function (event) {
    var url = event.target.dataset.url
    wx.previewImage({
      current: 'url', // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
    })
  },
  // onShareAppMessage: function (res) {
  //   var that = this;
  //   var title = '';
  //   if (that.data.conversationType == 3) {
  //     title = '融云青年群';
  //   } else if (that.data.senderUserInfo) {
  //     title = that.data.senderUserInfo.name;
  //   } else {
  //     title = getUser(targetId).name;
  //   }
  //   return {
  //     title: title,
  //     path: '/pages/im/chat/chat?targetId=' + targetId + '&conversationType=' + that.data.conversationType,
  //     success: function (res) {
  //       // 转发成功
  //     },
  //     fail: function (res) {
  //       // 转发失败
  //     }
  //   }
  // },
  init: function () {
    var that = this;
    // 监听接受到的消息
    app.addListener(function (message) {
      console.log(message);
      var senderUserId = '';
      if (message.conversationType == 3) {
        senderUserId = message.targetId;
      } else {
        senderUserId = message.senderUserId;
      }
      if (senderUserId == targetId) {
        if (message.content.user) {
          that.setData({
            senderUserInfo: message.content.user
          });
        }
        var list = that.data.messageList;
        console.log('aaaaaa')
        console.log(list)
        if (message.content.content) {
          message.content.content = emoji.unicodeToEmoji(message.content.content);
        }
        list.push(message);
        modifyMessage(list, that);
        that.setData({
          messageList: list,
          toView: list[list.length - 1].messageUId
        });
      }
    });

    // 获取历史消息记录
    that._im = RongIMClient.getInstance();
    var callback = function (list, hasMsg) {
      if (list.length > 0) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].content.content) {
            list[i].content.content = emoji.unicodeToEmoji(list[i].content.content);
          }
        }
        modifyMessage(list, that);
        that.setData({
          messageList: list
        });
        console.log(list);
        that.setData({
          toView: 'rcd-to-view'
        });
      }
      if (title) {
        wx.setNavigationBarTitle({
          title: title
        })
      }
      console.log(hasMsg);
      that.setData({
        hasMore: hasMsg
      });
    }
    getHistoryMessage(that, 0, 20, callback);
    // 发送小Q的聊天消息
    var messageXiaoQList = wx.getStorageSync('msgXiaoqlist');
    if (messageXiaoQList.length) {
      for (let i = 0; i < messageXiaoQList.length; i++) {
        const textMessage = messageXiaoQList[i];
        var user = app.globalData.user;
        var msg = new RongIMLib.TextMessage({ content: textMessage, user: user });
        var params = {
          context: that,
          type: that.data.conversationType,
          targetId: targetId,
          msg: msg
        };
        sendMessage(params);
      }
      wx.removeStorageSync('msgXiaoqlist');
    }
  },
  onLoad: function (options) {
    var that = this;
    var t;
    var emojis1 = emojis.slice(0, 24);
    var emojis2 = emojis.slice(25, 49);
    var emojis3 = emojis.slice(50, 74);
    var emojis4 = emojis.slice(75, 99);
    var emojis5 = emojis.slice(100, 124);
    var emojis6 = emojis.slice(125, 128);
    var allEmojis = [emojis1, emojis2, emojis3, emojis4, emojis5, emojis6];
    //注册通知
    WxNotificationCenter.addNotification('NotificationName', that.didNotification, that)
    that.setData({
      allEmojis: allEmojis
    });
    targetId = options.targetId;
    title = options.title;
    console.log(options)
    that.setData({
      targetId: options.targetId,
      userInfo: app.globalData.user,
      conversationType: 1,
      agentName: title
    });
    // if (options.conversationType == 3) {
    //   wx.setNavigationBarTitle({
    //     title: '融云青年群'
    //   })
    // }
    
    var agnetuserInfo = getUser(targetId);
    console.log(agnetuserInfo)
    if (agnetuserInfo!=undefined){
      if (agnetuserInfo.isPub == 1) {
        that.setData({
          telOpen: true,
        })
      }
    }
    
    t = setInterval(function () {
      if (app.globalData.connect) {
        clearInterval(t);
        that.init();
      }
    }, 500);
    setTimeout(() => {
      if (app.globalData.connect) {
        that.init();
      }
    }, 3000);
  },
  onShow: function () {
    navigatClick = false;
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
        }else if (res.brand == 'Xiaomi') {
          percent = 0.42;
        } else if (res.brand == 'Meizu') {
          percent = 0.39;
        } else {
          precent = 0.41;
        }
        that.setData({
          imageWidth: res.screenWidth / 2 - 86,
          windowHeight: res.windowHeight,
          screenHeight: res.screenHeight,
          emojiWidth: Math.floor((res.screenWidth - 104) / 8),
          scrollHeight: res.windowHeight - 52,
          autoHeight: Math.round(res.screenHeight * percent),
          cursorSpacing: (Math.round(res.screenHeight * percent) - 5) * -1
        });
      }
    });
  },
  //通知处理
  didNotification: function (obj) {
    var agentList = app.globalData.agentList;
    //更新数据
    this.setData({
      agentList: obj
    });
    var agnetuserInfo = getUser(targetId);
    if (agnetuserInfo.isPub == 1) {
      this.setData({
        telOpen: true,
      })
    }
  },
  onHide:function () {
    if (navigatClick == false){
      wx.navigateBack({
        delta: 1
      })
    }
    
  },
  //公开手机号 
  publicPhone: function () {
    var self = this;
    // if (getUser(targetId)) {
    //   if (getUser(targetId).isPub == 0) {
    //     if (wjuserInfo.is_bind_phone == 0) {  //已经绑定手机号
    //       // 未公开手机号码,需要公开
    //       var url = 'api/message/public-mobile';
    //       var params = {
    //         agent_id: targetId.substr(5), // agent1  
    //         customer_id: app.globalData.wjuserInfo.uid
    //       }
    //       commonRequest.requestPost(url, params, function (res) {
    //         if (res.data.status) {
    //           commonRequest.showSuccess();
    //           self.setData({
    //             telOpen: true
    //           })
    //         }
    //       });
    //     } else {
    //       this.setData({
    //         showModal: true   //弹框提示绑定手机号
    //       });

    //     }
    //     // 更新联系人信息
    //     RCIMTools.getAgentList(app.globalData.wjuserInfo.uid, function (res) {
    //       app.globalData.agentList = res;
    //     });
    //   } else {
    //     self.setData({
    //       telOpen: true
    //     })
    //   }
    // }
    if (getUser(targetId)) {
      if (getUser(targetId).isPub == 0) {
        // 未公开手机号码,需要公开
        var url = 'api/message/public-mobile';
        var params = {
          agent_id: targetId.substr(5), // agent1  
          customer_id: app.globalData.wjuserInfo.uid
        }
        commonRequest.requestPost(url, params, function (res) {
          if (res.data.status) {
            commonRequest.showSuccess();
            self.setData({
              telOpen: true
            })
          }
        })
        // 更新联系人信息
        RCIMTools.getAgentList(app.globalData.wjuserInfo.uid, function (res) {
          app.globalData.agentList = res;
        });
      } else {
        self.setData({
          telOpen: true
        })
      }
    }
  },
  lookAgent: function () {
    navigatClick = true;
    var agent_id = targetId.substr(5);
    wx.setStorageSync('url', configUrl.TYHostURL + '/webapp/agent/personal/share/_v010003?agent_id=' + agent_id + '&customer_id=' + app.globalData.wjuserInfo.uid)
    wx.navigateTo({
      url: '../../webView/webView'
    })
  },
  downApp: function () {
    wx.setStorageSync('url', 'https://api.wujie.com.cn/webapp/wjload/detail/_v020904');
    wx.navigateTo({
      url: '../../webView/webView'
    })
  },
  clickActivity: function (e) {
    navigatClick = true;
    var url1 = e.currentTarget.dataset.url;
    var args = url1.split('?');
    console.log(args);
    var url = configUrl.TYHostURL + 'webapp/actinvitation/detail' + configUrl.TYVersion + '?' + args[1] + '&uid=' + app.globalData.wjuserInfo.uid
    console.log(url);
    if (app.globalData.wjuserInfo.is_bind_phone == 1) { //  需要绑定,获取手机号权限
      this.data.setData({
        showModal: true,
        activity_invita: url
      });

    } else {
      wx.setStorageSync('url', url);
      wx.navigateTo({
        url: '../../webView/webView'
      })
    }
  },
  clickBrand: function (e) {
    navigatClick = true;
    var url = e.currentTarget.dataset.url;
    utils.getQueryStringArgs(url, function (res) {
      console.log(res);
      wx.navigateTo({
        url: "../../brand/detail/detail?agent_id=" + res.agent_id + '&id=' + res.id + '&uid=' + app.globalData.wjuserInfo.uid + '&is_new=1'
        // url: "../../brand/detail/detail?id=" + res.id + '&uid' + app.globalData.uid
      })
    })
  },
  getPhoneNumber: function (e) {
    this.hideModal();
    var self = this;

    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      bindPhoneNumber.bindPhoneNumber(e.detail.encryptedData, e.detail.iv, function (res) {
        wx.setStorageSync('url', self.data.activity_invita);
        wx.navigateTo({
          url: '../../webView/webView'
        })
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '无界商圈只有获取你的手机号才能提供服务',
        showCancel: false,
        // success: function (res) {
        //   if (res.confirm) {
        //     console.log('用户点击确定')
        //     that.setData({
        //       showModal: true
        //     })
        //   }
        // }
      })
    }
  },

  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  // closeTop: function () {
  //   this.setData({
  //     top: false
  //   })
  // },
  

})