import util from '../../../utils/commonRequest';
Page({
  data:{
    page:1,
    pageSize:10,
    keywords:'',
    userID:0,
    brandList:[],
    showSearch:false,
    type:0,
    paddingTop:0,
    bottomText :'上拉加载更多',
    haveMore:true,
    nomessage:false
  },
  onLoad(options){
    let type= options.type;
    let wjuserInfo = wx.getStorageSync('wjuserInfo');
    if(type==1){ //意向
      this.setData({
        type:1,
        paddingTop:'15rpx',
        userID:options.uid || wjuserInfo.uid
      })
      this.getIntention()
      wx.setNavigationBarTitle({ 'title': '我的意向品牌'});
    }else if(type==2){  //浏览记录
      this.setData({
        showSearch:true,
        type:2,
        userID:options.uid || wjuserInfo.uid
      })
      this.getUserBrowser()
      wx.setNavigationBarTitle({ 'title': '品牌浏览记录'});
    }else if(type == 3){
      this.setData({
        // showSearch:true,
        type:3,
        userID:options.uid || wjuserInfo.uid
      })
      this.getCollectList()
      wx.setNavigationBarTitle({ 'title': '我的收藏品牌'});
    }
    
  },
  
  //意向品牌
  getIntention(){
    util.showLoading('数据加载中...');
    let _this = this;
    let params={
      'uid':this.data.userID,
      'page':this.data.page,
      'pageSize':this.data.pageSize
    }
    util.requestPost("api/user/intent-brands", params, function (res) {
      if(res.data.message.length < _this.data.pageSize){
          _this.setData({
            bottomText:'数据加载完毕',
            haveMore:false
          })
      }
      if (_this.data.page == 1) {
        _this.setData({
          brandList: res.data.message,
          nomessage:res.data.message.length > 0 ? false : true
        });
      } else {
        _this.setData({
          brandList: _this.data.brandList.concat(res.data.message)
        })
      }
      util.hideToast();
    });
  },
  //浏览记录
  getUserBrowser(){
    util.showLoading('数据加载中...');
    let _this = this;
    let params={
      'uid':this.data.userID,
      'page':this.data.page,
      'pageSize':this.data.pageSize,
      'keywords':this.data.keywords
    }
    util.requestPost("api/user/brands-browse", params, function (res) {
      
      if (_this.data.page == 1) {
        _this.setData({
          brandList: res.data.message,
          nomessage:res.data.message.length > 0 ? false : true
        });
      } else {
        _this.setData({
          brandList: _this.data.brandList.concat(res.data.message)
        })
      }
      if(res.data.message.length < _this.data.pageSize){
            _this.setData({
              bottomText:'数据加载完毕',
              haveMore:false
            })
        }
      util.hideToast();
    });
  },
  //收藏品牌列表
  getCollectList(){
    util.showLoading('数据加载中...');
    let _this = this;
    let params={
      'uid':this.data.userID,
      'model':'brand',
      'page':this.data.page,
      'pageSize':this.data.pageSize,
      'keywords':this.data.keywords
    }
    util.requestPost("api/user/favorite", params, function (res) {  
      if(res.data.message.length < params.pageSize){
        _this.setData({
          bottomText:'数据加载完毕',
          haveMore:false
        })
      }
      if (_this.data.page == 1) {
        _this.setData({
          brandList: res.data.message,
          nomessage:res.data.message.length > 0 ? false : true
        });
      } else {
        _this.setData({
          brandList: _this.data.brandList.concat(res.data.message)
        })
      }
      util.hideToast();
    });
  },
  searchByWords(e){
    let value = e.detail.value;
    this.setData({
      keywords:value,
    })
    this.getUserBrowser();
  },
  //下拉刷新
  onReachBottom(){
    if(this.data.haveMore){
      this.setData({
        page: ++ this.data.page
      })
      console.log(this.data.page)
      if(this.data.type == 1){
        this.getIntention()
      }else if(this.data.type == 2){
        this.getUserBrowser()
      }else if(this.data.type == 3){
        this.getCollectList()
      }
    }
  },
  //跳品牌详情
  toBrandDetail(e){
    let id=e.currentTarget.dataset.id;
    // console.log(this.data.userID);
    // return;
    wx.navigateTo({
      url: '../detail/detail?id='+id+'&uid='+this.data.userID
    })
  },

})