const config = require("../../../utils/config.js");
const util = require('../../../utils/commonRequest.js');
const app = getApp();
Page({
  data: {
        uid:'',
        page:1,
        pageSize:10000,
        common:[],
        brand:[],
        reward:[],
        length:1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  getRedPacketList:function(){
                                var params={
                                             uid:this.data.uid,
                                             page:this.data.page,
                                             pageSize:this.data.pageSize,
                                             status:0,
                                      }
                                      var url="api/user/packagelist";
                                      var _this=this;
                                util.requestPost(url, params, function (res){
                                        // if(res.data.message.status==true){
                                          _this.setData({
                                                  common:res.data.message.common,
                                                  brand:res.data.message.brand,
                                                  reward:res.data.message.reward,
                                                  length:res.data.message.count,
                                                  
                                         }) 
                                        // }else if(res.data.message.status===false){
                                        //   _this.setData({
                                        //          length:1
                                        //       }) 
                                        // }
                                         
                                  }) 
              
                  
  },
  goMore:function(){
    var url = config.TYHostURL + '/webapp/protocol/venture' + config.TYVersion;
               console.log(url+'路径');
               wx.setStorageSync('url',url);
               wx.navigateTo({
                        url: '../../webView/webView'
                      })                    
  },
  goBrandlist:function(){
          // var url ='https://api.wujie.com.cn/webapp/wjload/detail/';
          //     wx.setStorageSync('url',url);
                     wx.navigateTo({
                        url: '../../../pages/brand/brands/brands'
                      })
  },
  onLoad: function (options){
                              if (app.globalData.wjuserInfo) {
                                                   this.setData({
                                                     uid: app.globalData.wjuserInfo.uid
                                                   })
                                     console.log('列表页'+this.data.uid)
                                  }
                               this.getRedPacketList();
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
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
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }

})