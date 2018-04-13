import util from '../../../utils/commonRequest';
Page({
  data:{

  },
  onLoad(options){
    let params = {};
        params['brand_id'] = options.id;
    let _this =this;
    util.requestPost("api/brand/question", params, function (res) {
      if(res.data.status){
        console.log(res.data.message)
        _this.setData({
          questions:res.data.message.questions
        })
      }
    })
  }
})