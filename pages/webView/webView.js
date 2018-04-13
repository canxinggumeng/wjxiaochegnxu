// pages/webView/webView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webURL:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var url = wx.getStorageSync('url')
    // H5更改后，将设置为2
    url = url + '&is_share=1';
    console.log(url);
    this.setData({
      webURL:url
    });
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
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // }
})