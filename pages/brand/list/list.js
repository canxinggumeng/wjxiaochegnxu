// pages/brand/list/list.js
const config = require("../../../utils/config.js");
const util = require('../../../utils/commonRequest.js');
const app = getApp();
var countdown = 60;
var settime = function (that) {
                           if (countdown == 0) {
                            that.setData({
                             is_show: true
                            })
                            countdown = 60;
                            return;
                           } else {
                            that.setData({
                             is_show:false,
                             last_time:countdown
                            })
                            countdown--;
                           }
                           setTimeout(function () {
                            settime(that)
                           }
                            , 1000)
}
Page({
  data: {
        uid:'',
        href:'',
        imgUrls: [],
        topicList: [],
        topicList1: [],
        bannerList:[],
        brandList: [],
        page: 1,
        //下拉加载与没有更多显示与否
        getmore:true,
        nomore:false,
        page_size:10,
        interval: 2000,
        duration: 1000,
        initshow:0,
        is_bind:'',
        last_time:'',
        is_show:true,
        phoneNumber:'',
        yanzhenNumber:'',
        disable:true,
        errMessage:'请输入正确手机号',
        red_packet_id:''
  },
  
  //返回顶部
  goTop: function (e) {
                       if (wx.pageScrollTo) {
                        if(wx.pageScrollTo>400){
                           wx.pageScrollTo({
                            duration: 3000,
                            scrollTop: 0
                            })
                        }else{
                           wx.pageScrollTo({
                            duration: 1000,
                            scrollTop: 0
                            })
                            }
                         
                          } 
  },
  //这是走的banner图跳转
  goRouter:function(event){
        if(event.currentTarget.dataset.url){
           var url = event.currentTarget.dataset.url+'&uid='+this.data.uid;
               console.log(url+'路径');
               wx.setStorageSync('url',url);
               wx.navigateTo({
                        url: '../../webView/webView'
                      })
        }                      
  },
  //去品牌分类列表
  goDetail:function(event){
       if(event.currentTarget.dataset.id){
           var id = event.currentTarget.dataset.id;
               wx.navigateTo({
                        url: '../../../pages/brand/brands/brands?id='+id
                      })
        }  
  },
   //去品牌详情页
  goBrandDetail:function(event){
        if(event.currentTarget.dataset.id){
             var id = event.currentTarget.dataset.id;
               wx.navigateTo({
                        url: '../../../pages/brand/detail/detail?id='+id+'&uid='+this.data.uid
                      })
        }
  },
  //取得是用户的uid
  getWxUserInfo: function () { 
       this.setData({
        uid: app.globalData.wjuserInfo.uid
      })
  },
  //初始化数据
  onLoad: function (options){
                          this.getWxUserInfo();
                          this.getBannerLoop();
                          this.getBrandList();
                          this.getBrandcategories();
                          // this.curtail(this.data.topicList);
                          console.log('获取当前的uid：' + app.globalData.wjuserInfo.uid);
                          //取uid
                           if (app.globalData.wjuserInfo) {
                             this.setData({
                               uid: app.globalData.wjuserInfo.uid
                             })
                           }
                          this.getRedbaoBindPhone()
                         
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  },
  onUnload: function () {
                             

  },
  onPullDownRefresh: function () {
                              this.data.page = 1;
                              this.getBrandList();
                              // wx.stopPullDownRefresh();
  },
  //下拉刷新的功能
  onReachBottom: function () {
                              this.data.page += 1;
                              this.getBrandList();
  },
  // onShareAppMessage: function () {
  //                             console.log("分享")
  // },
  //请求品牌分类列表
  getBrandcategories:function(){
                             let _this=this,
                                   params={};
                             util.requestPost("api/brand/categories", params, function (res) {
                               var arr=_this.curtail(res.data.message);
                               var arr_=arr.sort(_this.compare('id'));
                              _this.setData({
                                    topicList:arr_
                                  })

                              });
  },
  //数组排序
  compare:function(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value2 - value1;
    }
  },
  //删除数组的第一项的
  curtail:function(arr) {
              var m = arr.slice(0);
                  m.shift();
                  return m;
          console.log(m)
  },
  // 请求品牌列表数据
  getBrandList: function () {
                              var _this = this;
                              var params = {
                                page: this.data.page,
                                page_size: "10"
                              };
                              // util.showLoading();
                              util.requestPost("api/brand/lists", params, function (res) {
                               // util.hideToast();
                                if(res.data.message.length<_this.data.page_size){
                                  _this.setData({
                                    nomore:true,
                                    getmore:false
                                  })
                                }
                                if (_this.data.page == 1) {
                                  _this.setData({
                                    brandList: res.data.message
                                  })
                                } else {
                                  _this.setData({
                                    brandList: _this.data.brandList.concat(res.data.message)
                                  })
                                }
                              });
  },
  //请求首页banner图数据
  getBannerLoop:function(){  
                              var _this=this;
                              var params={
                                  page:1,
                                  page_size:15,
                                  type:'app_index_banner'
                                };
                              util.requestPost("api/ad/list", params, function (res){
                              _this.setData({
                               imgUrls: res.data.message
                              })
                          });
  },
  // 请求相关的红包数据
  getRedbaoBindPhone(){
                         var _this=this;
                         var params={
                             uid:this.data.uid
                         }
                         util.requestPost("api/redpacket/is-receive-register-redpacket", params, function (res){
                             if(res.data.status===true){
                                _this.setData({
                                 initshow:1,
                                 is_bind: res.data.message.is_bind,
                                 red_packet_id:res.data.message.red_packet_id
                              })
                             }else if(res.data.status===false){
                               _this.setData({
                                 // is_bind:0,
                                 // initshow: 1
                                 initshow: 0
                              })
                             }
                             
                          });

  },
  // 关闭红包弹框
  offMeng:function(){
                          this.setData({
                                            initshow: 0
                                 })   
  },
  // 点击领取红包跳转
  goNext:function(event){
  //需要注册领取红包
        if(event.currentTarget.dataset.tag==1){
                          this.setData({
                                              initshow: 2
                                        })  
  //不需要注册领取红包 
        }else if(event.currentTarget.dataset.tag==0){
                          this.setData({
                                               initshow: 3
                                         }) 
               this.getMyRedList(); 
        }         
  },
  bindInputPhone:function(e){
                          this.setData({
                                        phoneNumber:e.detail.value
                        })
  },
  bindInputYanzhenma:function(e){
                          this.setData({
                                        yanzhenNumber:e.detail.value
                        })
  },
  // 获取手机验证码
  getCode:function(){
                         var _this=this;
                         var params={
                             username:this.data.phoneNumber,
                             type:'xcx_bing_phone',
                             nation_code:'86'
                         }
                         var ret = /^1\d{10}$/; 
                        if(ret.test(this.data.phoneNumber)){
                              settime(_this);
                              _this.setData({
                              is_show: (!_this.data.is_show),
                              disable:false  //false
                             })  
                          util.requestPost("api/identify/sendcode", params, function (res){
                            wx.showToast({
                              title: res.data.message,
                              icon: 'none',
                              duration: 1500,
                              mask: true
                            })    
                          }); 
                        }else{
                          wx.showToast({
                                      title: '请输入正确手机号',
                                      icon: 'none',
                                      duration: 1500,
                                      mask:true
                                      })
                        }

                         
  },
  //发送手机验证码和手机号领红包
  sendPhone:function(){
                      var _this=this;
                      var params={
                                     uid:this.data.uid,
                                     phone:this.data.phoneNumber,
                                     code:this.data.yanzhenNumber,
                                     is_verify_code:'1',
                                     type:'xcx_bing_phone',
                                     nation_code:'86'
                                 }
                       console.log(params);  
                  if(this.data.yanzhenNumber){
                        util.requestPost("api/login/bind-phone-xcx", params, function (res){  
                           //提交手机号码和验证之后到我的通用红包页
                           if(res.data.status===true){
                                 _this.setData({
                                       initshow: 3,
                                       uid:res.data.message.uid
                                      }) 
                                 app.globalData.wjuserInfo.userId = _this.data.uid;
                                 app.globalData.wjuserInfo.uid = _this.data.uid;
                                 wx.setStorageSync('wjuserInfo', app.globalData.wjuserInfo);
                                 console.log(app.globalData.wjuserInfo);
                               _this.getMyRedList();
                           }else if(res.data.status===false){
                                wx.showToast({
                                              title: res.data.message,
                                              icon: 'none',
                                              duration: 1500,
                                              mask:true
                                              })
                           }
                           
                         });  
               }else{
                            wx.showToast({
                                            title: '请输入正确手机号和验证码',
                                            icon: 'none',
                                            duration: 1500,
                                            mask:true
                                          })
                  }                 

  },
  //点击领取红包
   clickVerify:function(){
                          var that = this;
                              this.getCode();
                         console.log(this.data.phoneNumber)
   },
   // 手机号码和验证发送成功之后的领取红包的接口
   getMyRedList:function(){
                                      var params={
                                           redpacket_ids:this.data.red_packet_id,
                                           uid:this.data.uid,
                                           soure:0
                                      }
                                      var url="agent/user/custom-receive-redpacket";
                                      util.requestPost(url, params, function (res){
// <form bindsubmit="formSubmit" bindreset="formReset">
                                       }) 
   },
   //跳转红包列表页
   goMyRedList:function(){
                          wx.navigateTo({
                                         url: '../redlist/redlist'
                              })

   }
                       
})