Page({
  data: {
    href:''
  },
 
  onLoad: function (options){
    var value = wx.getStorageSync('url');
    wx.removeStorageSync('url');
        this.setData({
              href:value
        })                  

  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  },
  onUnload: function () {

  }
})