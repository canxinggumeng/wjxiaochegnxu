import api from '../../../utils/api';
import common from '../../../utils/commonRequest';
import WxParse from '../../../wxParse/wxParse';
import BindPhone from '../../untils/BindPhone/BindPhone';
import config from '../../../utils/config';
import util from '../../../utils/commonRequest';
import untils from '../../../utils/util';
import RCIMTools from '../../../pages/untils/RCIMTools/RCIMTools';
const app = getApp();
let countdown = 60;
let settime = function (that) {
  if (countdown == 0) {
    that.setData({
      is_show: true
    })
    countdown = 60;
    return;
  } else {
    that.setData({
      is_show: false,
      last_time: countdown
    })
    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }, 1000)
}
Page({
  data: {
    'id': 0,
    'uid': 0,
    'imgUrls': [],
    'autoplay': true,
    'interval': 2000,
    'duration': 500,
    'show_proname': false,
    'brandName': '品牌',
    'showBigPic': false,
    'packetList': [],
    'idArr': [],
    'packet_module': false,
    'packelist_module': false,
    'showModule': false,
    'showModal': false,
    'collType': false, //已收藏
    'showForecast': false,
    'disable': true,
    'is_new': 0,
    'initshow': 0,
    'is_bind': '',
    'last_time': '',
    'is_show': true,
    'is_bind_phone': false,
    'canClick': true,
    'red_packet': false
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let self = this;
    let param = {};
    let wjuserInfo = wx.getStorageSync('wjuserInfo');
    let first = wx.getStorageSync('firstView');
    if (options.is_new == 1 && first != 1) { //判断是否是分享进入
      // app.userLoginInfoCallBack = res => {

      self.setData({
        id: options.id,
        uid: wjuserInfo.uid,
        agent_id: options.agent_id,
        is_new: options.is_new
      })
      param = {
        'id': this.data.id,
        'uid': this.data.uid,
        'is_send_cloud_info': '1'
      };
      this.getBrandDetail(param);
      this.putHistory(param.id, param.uid)
      wx.setStorageSync('firstView', '1')
      this.getShareMessage()
      // } 
    } else {
      console.log(3333);
      //判断融云链接次数
      if (app.globalData.connectNum == 0) {
        if (wjuserInfo) {
          app.connectRCIM(wjuserInfo.token);
          console.log('asdfghjk' + app.globalData.connectNum);
          app.globalData.connectNum = 0;
        }

      }
      this.setData({
        id: options.id,
        uid: options.uid || app.globalData.wjuserInfo.uid,
        // agent_id:options.agent_id,
        // is_new:options.is_new
      })
      param = {
        'id': this.data.id,
        'uid': this.data.uid,
        'is_send_cloud_info': '1'
      };
      this.getBrandDetail(param);
      this.putHistory(param.id, param.uid)
      console.log(this.data)
    }


  },
  getBrandDetail(param) {
    api.post('api/brand/detail', param)
      .then(res => {
        let datas = res.data.message;
        let brand = datas.brand,
          comment = datas.comment;
        if (datas.brand.red_packet == 1) {
          this.setData({
            red_packet: true
          })
        } else {
          this.setData({
            red_packet: false
          })
        }
        this.setData({
          brandName: brand.name,
          imgUrls: datas.banners,
          companyName: brand.company,
          views: brand.click_num,
          collects: brand.favorite_count,
          shares: brand.share_num,
          min: brand.investment_min,
          max: brand.investment_max,
          slogan: brand.slogan,
          category_name: brand.category_name,
          join_area: brand.join_area,
          store_area: brand.store_area,
          contract_deadline: brand.contract_deadline,
          shops_num: brand.shops_num,
          products: brand.products,
          forecast: [{
              'name': '初始投资总额',
              'num': brand.initial_investment
            },
            {
              'name': '客单价',
              'num': brand.single_customer_price
            },
            {
              'name': '日客流量',
              'num': brand.day_flow
            },
            {
              'name': '预估月销售额',
              'num': brand.month_sales_mount
            },
            {
              'name': '毛利率',
              'num': brand.margin_rate
            },
            {
              'name': '回报周期',
              'num': brand.return_period
            }
          ],
          detail_images: brand.detail_images, //主打产品
          show_images: brand.detail_images.length > 2 ? brand.detail_images.slice(0, 2) : brand.detail_images,
          store_img: datas.store_img, //门店实景
          show_store: datas.store_img.length > 0 ? true : false,
          questions: datas.questions,
          collType: datas.relation.is_favorite == 0 ? false : true,
          share_img: brand.xcx_share_img,
          'is_bind_phone': datas.is_bind_phone == 0 ? true : false
        });
        wx.setNavigationBarTitle({
          'title': this.data.brandName
        });
        let that = this;
        WxParse.wxParse('detail', 'html', brand.detail, that, 15);
        WxParse.wxParse('league', 'html', brand.league, that, 15);
        WxParse.wxParse('advantage', 'html', brand.advantage, that, 15);
        WxParse.wxParse('prerequisite', 'html', brand.prerequisite, that, 15);
        for (let i = 0; i < this.data.detail_images.length; i++) {
          if (this.data.detail_images[i].good_name != '') {
            that.data.show_proname = true;
            break;
          };
        }
        for (let j = 0; j < this.data.forecast.length; j++) {
          if (this.data.forecast[j].num) {
            this.setData({
              showForecast: true
            });
            break;
          }
        }

      });
  },
  //营销数据反馈
  getShareMessage() {
    let param = {};
    if (this.data.agent_id) {
      param = {
        agent_id: this.data.agent_id,
        uid: this.data.uid,
        share_type: 1,
        post_id: this.data.id
      }
      console.log('营销数据查看')
      api.post('api/login/agent-share-log', param).then(res => {
        console.log(res.data)
      })
    }
  },
  //设置分享信息
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自页面内转发按钮
    }
    let _this = this;
    return {
      title: this.data.brandName,
      path: '/pages/brand/detail/detail?id=' + this.data.id + '&is_new=1',
      imageUrl: config.TYHostURL + this.data.share_img,
      success: function (res) {
        // 转发成功
        _this.addShareCount();

      },
      // fail: function(res) {
      //   // 转发失败
      // }
    }
  },
  //转发次数加1
  addShareCount() {
    let param = {
      'uid': this.data.uid,
      'content_id': this.data.id,
      'content': 'brand',
      'source': 'weixin'
    }
    api.post('api/share/share', param).then(res => {
      console.log(res.data.message);
    })
  },
  //设置收藏按钮
  getCollect() {
    let param = {};
    param['id'] = this.data.id;
    param['uid'] = this.data.uid;
    param['type'] = this.data.collType ? 'undo' : 'do';
    api.post('api/brand/collect', param).then(res => {
      this.setData({
        collType: !this.data.collType
      });
      this.data.collType ? common.tips('收藏成功', 2000) : common.tips('取消收藏成功', 2000)
    })
  },
  // 获取红包信息
  awardDetail: function () {
    let params = {};
    params['brand_id'] = this.data.id;
    params['uid'] = this.data.uid;
    api.post('api/brand/get-brand-redpacket' + config.TYVersion, params).then((res) => {
      let data = res.data;
      if (data.status) {
        for (let i = 0; i < data.message.redpacket.length; i++) {
          this.data.idArr.push(data.message.redpacket[i].id)
        }
        this.setData({
          packetTotal: data.message.total,
          packetList: data.message.redpacket,
          idArr: this.data.idArr,
          packet_module: true,
          showModule: true
        })
      } else if (data.message == 'no_redpacket') {
        common.tips('你来晚了,红包已领完', 2000)
      } else if (data.message == 'all_received') {
        common.tips('你已经领取过了', 2000)
      }
    })
  },
  //领取红包
  award: function (ids, uid) {
    let param = {};
    param['redpacket_ids'] = ids.join(',');
    param['uid'] = uid;
    param['soure'] = '3';
    api.post('agent/user/custom-receive-redpacket' + config.TYVersion, param).then((res) => {
      if (res.data.status) {
        this.setData({
          is_get: true,
          packelist_module: true,
          packet_module: false
        })
      } else {
        common.tips('领取失败', 2000);
      }
    })
  },
  getPacketList() {
    if (this.data.is_get) {
      common.tips('你已经领取过了', 2000)
    } else {
      this.awardDetail();
    }

  },
  getPacket() {
    this.award(this.data.idArr, this.data.uid)
  },

  //关闭弹窗
  closeModule() {
    this.setData({
      packelist_module: false,
      packet_module: false,
      showModule: false
    })
  },
  showBigpic(e) {
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;
    if (type == 'store') {
      this.setData({
        showBigStorePic: true,
        showBigProPic: false,
        current: index
      })
    } else if (type == 'pro') {
      this.setData({
        showBigStorePic: false,
        showBigProPic: true,
        current: index
      })
    }
  },
  //问答详情
  toQueList() {
    wx.navigateTo({
      url: '../queAns/list?id=' + this.data.id
    })
  },
  BindPhoneModule() {
    if (this.data.is_new == 1 && !this.data.is_bind_phone) {
      var wjuserInfo = wx.getStorageSync('wjuserInfo');
      if (wjuserInfo.is_bind_phone == 0) { //已经绑定手机号
        this.gotoHome(); //直接去首页
      } else {
        this.setData({
          showModal: true //弹框提示绑定手机号
        })
      }
      // this.setData({
      //   showModal:true
      // })
    } else {
      this.gotoHome()
    }
  },
  getPhoneNumber: function (e) {
    // this.hideModal()
    this.setData({
      showModal: false
    })
    var that = this;
    BindPhone.bindPhoneNumber(e.detail.encryptedData, e.detail.iv, function (res) {
      that.gotoHome();
    })
  },
  //跳首页
  gotoHome() {
    wx.reLaunch({
      url: '../list/list'
    })
  },
  consultBottomPrice() {
    let _this = this;
    if (this.data.canClick) {
      this.getRedbaoBindPhone()
      console.log(11111);
    };
    this.setData({
      canClick: false
    })
    setTimeout(function () {
      _this.setData({
        canClick: true
      })
    }, 1500)
  },
  //跳小Q
  toChat() {

    var that = this;
    let param = {
      'brand_id': this.data.id,
      'uid': this.data.uid
    }
    wx.showLoading({
      title: '对接中',
    });
    api.post('api/brand/advisory', param).then(res => {
      wx.hideLoading();
      if (res.data.message.agent_id) {
        var message = res.data.message;
        RCIMTools.getAgentList(app.globalData.wjuserInfo.uid, function (res) {

          app.globalData.agentList = res;
          var targetID = 'agent' + message.agent_id;
          var urlTpl = '../../im/chat/chat?targetId={0}&conversationType={1}&title={2}';
          var url = untils.stringFormat(urlTpl, [targetID, 1, message.agent_name]);
          wx.navigateTo({
            url: url
          });

        });
      } else {
        wx.showModal({
          title: '提示',
          content: '对接失败,请重试',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      }
    })
  },
  // //根据指定条件获取品牌信息,发送融云消息
  // getBrandInfo(datas){
  //   let param = {
  //     agent_id:datas.agent_id,
  //     customer_id:this.data.uid,
  //     brand_id:this.data.id
  //   }
  //   api.post('api/message/send-rong-brand-info',param).then(res=>{
  //     if(res.data.status){
  //       common.hideToast()
  //       //没有对接经纪人，跳小Q
  //       wx.navigateTo({
  //         url: '/pages/im/chat/chat?targetId=agent'+datas.agent_id+'&title='+datas.agent_name,
  //         success: function(res){
  //           // success
  //         },
  //         // fail: function() {
  //         //   // fail
  //         // },
  //         // complete: function() {
  //         //   // complete
  //         // }
  //       })
  //     }
  //   })
  // },
  formSubmit: function(e) {
    console.log('获取到的fromid为: ',e.detail.formId);
    this.consultBottomPrice();
  },
  //添加浏览记录
  putHistory(id, uid) {
    let param = {
      'uid': uid,
      'relation': 'brand',
      'relation_id': id
    }
    api.post('api/user/add-browse', param).then(res => {
      if (res.data.status) {
        console.log('浏览成功')
      }
    })
  },
  hideBigPic() {
    this.setData({
      showBigProPic: false,
      showBigStorePic: false
    });
    console.log('隐藏')
  },
  stopUp(e) {
    console.log('阻止隐藏');
    // return false;
  },

  // 请求相关的红包数据
  getRedbaoBindPhone() {
    var _this = this;
    var params = {
      uid: this.data.uid
    }
    util.requestPost("api/redpacket/is-receive-register-redpacket", params, function (res) {
      console.log(res);
      if (res.data.status === true) {
        _this.setData({
          initshow: 1,
          is_bind: res.data.message.is_bind,
          red_packet_id: res.data.message.red_packet_id
        })
      } else if (res.data.status === false) {
        _this.setData({
          initshow: 0
        })
        if (res.data.message == '您已经领过了') {
          _this.toChat();
        }
      }

    });

  },
  // 关闭红包弹框
  offMeng: function () {
    this.setData({
      initshow: 0
    })
  },
  // 点击领取红包跳转
  goNext: function (event) {
    //需要注册领取红包
    if (event.currentTarget.dataset.tag == 1) {
      this.setData({
        initshow: 2
      })
      //不需要注册领取红包 
    } else if (event.currentTarget.dataset.tag == 0) {
      this.setData({
        is_bind_phone: true,
        initshow: 0 //下级页面返回该页面的时候，弹框消失
      })
      this.toChat();
    }
  },
  bindInputPhone: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },
  bindInputYanzhenma: function (e) {
    this.setData({
      yanzhenNumber: e.detail.value
    })
  },
  // 获取手机验证码
  getCode: function () {
    var _this = this;
    var params = {
      username: this.data.phoneNumber,
      type: 'xcx_bing_phone',
      nation_code: '86'
    }
    var ret = /^1\d{10}$/;
    if (ret.test(this.data.phoneNumber)) {
      settime(_this);
      _this.setData({
        is_show: (!_this.data.is_show),
        disable: false //false
      })
      util.requestPost("api/identify/sendcode", params, function (res) {
        wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1500,
            mask: true
          })
      });
    } else {
      wx.showToast({
        title: '请输入正确手机号',
        icon: 'none',
        duration: 1500,
        mask: true
      })
    }


  },
  //发送手机验证码和手机号领红包
  sendPhone: function () {
    var _this = this;
    var params = {
      uid: this.data.uid,
      phone: this.data.phoneNumber,
      code: this.data.yanzhenNumber,
      is_verify_code: '1',
      type: 'xcx_bing_phone',
      nation_code: '86'
    }
    console.log(params);
    if (this.data.yanzhenNumber) {
      util.requestPost("api/login/bind-phone-xcx", params, function (res) {
        //提交手机号码和验证之后到我的通用红包页
        if (res.data.status === true) {
          _this.setData({
            // initshow: 3
            is_bind_phone: true,
            uid: res.data.message.uid,
            initshow: 0 //下级页面返回该页面的时候，弹框消失
          })
          _this.getMyRedList();
        } else if (res.data.status === false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1500,
            mask: true
          })
        }

      });
    } else {
      wx.showToast({
        title: '请输入正确手机号和验证码',
        icon: 'none',
        duration: 1500,
        mask: true
      })
    }

  },
  //点击领取红包
  clickVerify: function () {
    var that = this;
    this.getCode();
    console.log(this.data.phoneNumber)
  },
  // 领取红包的接口
  getMyRedList: function () {
    var params = {
      redpacket_ids: this.data.red_packet_id,
      uid: this.data.uid,
      soure: 0
    }
    var url = "agent/user/custom-receive-redpacket";
    let that = this;
    util.requestPost(url, params, function (res) {
      if (res.data.status) {
        wx.showToast({
          title: '领取成功',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        that.toChat();
      } else {
        wx.showToast({
          title: '领取失败',
          icon: 'none',
          duration: 1500,
          mask: true
        });
      }

    })
  },
  //跳转红包列表页
  goMyRedList: function () {
    wx.navigateTo({
      url: '../redlist/redlist'
    })

  }

})